import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { nanoid } from 'nanoid';
import {
  DiscussionCategory,
  DiscussionThread,
  DiscussionReply,
  DiscussionReplyLike,
} from './entities';
import {
  CreateThreadDto,
  UpdateThreadDto,
  CreateReplyDto,
  ThreadQueryDto,
  ModerateThreadDto,
  ThreadSortBy,
} from './dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../common/interfaces/response.interface';

@Injectable()
export class DiscussionsService {
  private readonly logger = new Logger(DiscussionsService.name);

  constructor(
    @InjectRepository(DiscussionCategory)
    private readonly categoryRepository: Repository<DiscussionCategory>,
    @InjectRepository(DiscussionThread)
    private readonly threadRepository: Repository<DiscussionThread>,
    @InjectRepository(DiscussionReply)
    private readonly replyRepository: Repository<DiscussionReply>,
    @InjectRepository(DiscussionReplyLike)
    private readonly replyLikeRepository: Repository<DiscussionReplyLike>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────
  //  Categories
  // ──────────────────────────────────────────────

  async getCategories(): Promise<ApiResponse<DiscussionCategory[]>> {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Discussion categories retrieved successfully',
      data: categories,
    };
  }

  // ──────────────────────────────────────────────
  //  Create thread
  // ──────────────────────────────────────────────

  async createThread(
    userId: string,
    dto: CreateThreadDto,
  ): Promise<ApiResponse<DiscussionThread>> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID "${dto.categoryId}" not found`,
      );
    }

    const slug = this.generateSlug(dto.title);

    const thread = this.threadRepository.create({
      userId,
      categoryId: dto.categoryId,
      title: dto.title,
      content: dto.content,
      slug,
      tags: dto.tags || [],
    });

    const savedThread = await this.threadRepository.save(thread);

    // Increment category thread count
    await this.categoryRepository.increment(
      { id: dto.categoryId },
      'threadCount',
      1,
    );

    this.eventEmitter.emit('thread.created', {
      userId,
      threadId: savedThread.id,
    });

    this.logger.debug(
      `Thread "${savedThread.title}" created by user ${userId} in category ${category.name}`,
    );

    return {
      status: 'success',
      message: 'Thread created successfully',
      data: savedThread,
    };
  }

  // ──────────────────────────────────────────────
  //  Get threads (paginated)
  // ──────────────────────────────────────────────

  async getThreads(
    query: ThreadQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<DiscussionThread>>> {
    const { page, limit, categorySlug, sortBy, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.threadRepository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.user', 'user')
      .leftJoinAndSelect('thread.category', 'category');

    // Filter by category slug
    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    // Search by title
    if (search) {
      qb.andWhere('thread.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Pinned threads first, then apply sort
    qb.addOrderBy('thread.isPinned', 'DESC');

    switch (sortBy) {
      case ThreadSortBy.ACTIVE:
        qb.addOrderBy('thread.lastReplyAt', 'DESC', 'NULLS LAST');
        break;
      case ThreadSortBy.POPULAR:
        qb.addOrderBy('thread.replyCount', 'DESC');
        break;
      case ThreadSortBy.NEWEST:
      default:
        qb.addOrderBy('thread.createdAt', 'DESC');
        break;
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      message: 'Threads retrieved successfully',
      data: {
        items,
        meta: {
          total,
          page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        total,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Get single thread
  // ──────────────────────────────────────────────

  async getThread(
    slugOrId: string,
  ): Promise<ApiResponse<DiscussionThread & { nestedReplies?: any[] }>> {
    let thread = await this.threadRepository.findOne({
      where: { slug: slugOrId },
      relations: ['category', 'user', 'replies', 'replies.user'],
    });

    if (!thread) {
      thread = await this.threadRepository.findOne({
        where: { id: slugOrId },
        relations: ['category', 'user', 'replies', 'replies.user'],
      });
    }

    if (!thread) {
      throw new NotFoundException(`Thread "${slugOrId}" not found`);
    }

    // Increment view count
    await this.threadRepository.increment({ id: thread.id }, 'viewCount', 1);
    thread.viewCount += 1;

    // Build nested reply structure
    const nestedReplies = this.buildNestedReplies(thread.replies || []);

    return {
      status: 'success',
      message: 'Thread retrieved successfully',
      data: { ...thread, nestedReplies },
    };
  }

  // ──────────────────────────────────────────────
  //  Update thread
  // ──────────────────────────────────────────────

  async updateThread(
    id: string,
    userId: string,
    dto: UpdateThreadDto,
  ): Promise<ApiResponse<DiscussionThread>> {
    const thread = await this.threadRepository.findOne({ where: { id } });

    if (!thread) {
      throw new NotFoundException(`Thread with ID "${id}" not found`);
    }

    if (thread.userId !== userId) {
      throw new ForbiddenException('You can only update your own threads');
    }

    if (dto.categoryId && dto.categoryId !== thread.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID "${dto.categoryId}" not found`,
        );
      }
    }

    if (dto.title && dto.title !== thread.title) {
      thread.slug = this.generateSlug(dto.title);
    }

    Object.assign(thread, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.title && dto.title !== thread.title && { slug: thread.slug }),
    });

    const updatedThread = await this.threadRepository.save(thread);

    this.logger.debug(`Thread ${id} updated by user ${userId}`);

    return {
      status: 'success',
      message: 'Thread updated successfully',
      data: updatedThread,
    };
  }

  // ──────────────────────────────────────────────
  //  Delete thread
  // ──────────────────────────────────────────────

  async deleteThread(
    id: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    const thread = await this.threadRepository.findOne({ where: { id } });

    if (!thread) {
      throw new NotFoundException(`Thread with ID "${id}" not found`);
    }

    if (thread.userId !== userId) {
      throw new ForbiddenException('You can only delete your own threads');
    }

    await this.threadRepository.softDelete(id);

    // Decrement category thread count
    await this.categoryRepository.decrement(
      { id: thread.categoryId },
      'threadCount',
      1,
    );

    this.logger.debug(`Thread ${id} soft-deleted by user ${userId}`);

    return {
      status: 'success',
      message: 'Thread deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Create reply
  // ──────────────────────────────────────────────

  async createReply(
    threadId: string,
    userId: string,
    dto: CreateReplyDto,
  ): Promise<ApiResponse<DiscussionReply>> {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with ID "${threadId}" not found`);
    }

    if (thread.isLocked) {
      throw new BadRequestException(
        'This thread is locked. No new replies are allowed.',
      );
    }

    if (dto.parentId) {
      const parentReply = await this.replyRepository.findOne({
        where: { id: dto.parentId, threadId },
      });
      if (!parentReply) {
        throw new NotFoundException(
          `Parent reply with ID "${dto.parentId}" not found in this thread`,
        );
      }
    }

    const reply = this.replyRepository.create({
      threadId,
      userId,
      content: dto.content,
      parentId: dto.parentId || null,
    });

    const savedReply = await this.replyRepository.save(reply);

    // Update thread reply count and last reply timestamp
    await this.threadRepository.update(threadId, {
      replyCount: () => '"reply_count" + 1',
      lastReplyAt: new Date(),
    });

    this.eventEmitter.emit('reply.created', {
      userId,
      threadId,
      replyId: savedReply.id,
    });

    this.logger.debug(
      `Reply created by user ${userId} in thread ${threadId}`,
    );

    return {
      status: 'success',
      message: 'Reply created successfully',
      data: savedReply,
    };
  }

  // ──────────────────────────────────────────────
  //  Toggle reply like
  // ──────────────────────────────────────────────

  async toggleReplyLike(
    replyId: string,
    userId: string,
  ): Promise<ApiResponse<{ liked: boolean }>> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${replyId}" not found`);
    }

    const existingLike = await this.replyLikeRepository.findOne({
      where: { replyId, userId },
    });

    let liked: boolean;

    if (existingLike) {
      // Unlike — remove the like
      await this.replyLikeRepository.remove(existingLike);
      await this.replyRepository.decrement({ id: replyId }, 'likesCount', 1);
      liked = false;
    } else {
      // Like — create a new like
      const like = this.replyLikeRepository.create({ replyId, userId });
      await this.replyLikeRepository.save(like);
      await this.replyRepository.increment({ id: replyId }, 'likesCount', 1);
      liked = true;
    }

    this.logger.debug(
      `User ${userId} ${liked ? 'liked' : 'unliked'} reply ${replyId}`,
    );

    return {
      status: 'success',
      message: liked
        ? 'Reply liked successfully'
        : 'Reply unliked successfully',
      data: { liked },
    };
  }

  // ──────────────────────────────────────────────
  //  Mark reply as answer
  // ──────────────────────────────────────────────

  async markAsAnswer(
    replyId: string,
    userId: string,
  ): Promise<ApiResponse<DiscussionReply>> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId },
      relations: ['thread'],
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID "${replyId}" not found`);
    }

    if (reply.thread.userId !== userId) {
      throw new ForbiddenException(
        'Only the thread author can mark a reply as the answer',
      );
    }

    // Unmark any existing answer in this thread
    await this.replyRepository.update(
      { threadId: reply.threadId, isAnswer: true },
      { isAnswer: false },
    );

    // Mark this reply as the answer
    reply.isAnswer = true;
    const updatedReply = await this.replyRepository.save(reply);

    this.eventEmitter.emit('reply.marked_answer', {
      userId: reply.userId,
      threadId: reply.threadId,
      replyId,
    });

    this.logger.debug(
      `Reply ${replyId} marked as answer in thread ${reply.threadId}`,
    );

    return {
      status: 'success',
      message: 'Reply marked as answer successfully',
      data: updatedReply,
    };
  }

  // ──────────────────────────────────────────────
  //  Moderate thread (admin)
  // ──────────────────────────────────────────────

  async moderateThread(
    id: string,
    dto: ModerateThreadDto,
  ): Promise<ApiResponse<DiscussionThread>> {
    const thread = await this.threadRepository.findOne({ where: { id } });

    if (!thread) {
      throw new NotFoundException(`Thread with ID "${id}" not found`);
    }

    if (dto.isPinned !== undefined) {
      thread.isPinned = dto.isPinned;
    }
    if (dto.isLocked !== undefined) {
      thread.isLocked = dto.isLocked;
    }
    if (dto.isClosed !== undefined) {
      thread.isClosed = dto.isClosed;
    }

    const updatedThread = await this.threadRepository.save(thread);

    this.logger.log(
      `Thread ${id} moderated: pinned=${thread.isPinned}, locked=${thread.isLocked}, closed=${thread.isClosed}`,
    );

    return {
      status: 'success',
      message: 'Thread moderated successfully',
      data: updatedThread,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 300);

    const suffix = nanoid(8);
    return `${baseSlug}-${suffix}`;
  }

  private buildNestedReplies(replies: DiscussionReply[]): any[] {
    const replyMap = new Map<string, any>();
    const rootReplies: any[] = [];

    // First pass: create a map of all replies with a children array
    for (const reply of replies) {
      replyMap.set(reply.id, { ...reply, children: [] });
    }

    // Second pass: nest children under their parents
    for (const reply of replies) {
      const mappedReply = replyMap.get(reply.id);
      if (reply.parentId && replyMap.has(reply.parentId)) {
        replyMap.get(reply.parentId).children.push(mappedReply);
      } else {
        rootReplies.push(mappedReply);
      }
    }

    return rootReplies;
  }
}
