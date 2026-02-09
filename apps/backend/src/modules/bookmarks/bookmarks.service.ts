import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../../entities/bookmark.entity';
import { Post } from '../../entities/post.entity';
import { ApiResponse, PaginatedResponse } from '../../common/interfaces/response.interface';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);

  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAllForUser(
    userId: string,
    query: CursorPaginationDto,
  ): Promise<ApiResponse<PaginatedResponse<Bookmark>>> {
    const { cursor, limit = 20, sortOrder = 'DESC' } = query;

    const qb = this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .where('bookmark.userId = :userId', { userId });

    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere('bookmark.createdAt < :cursorValue', {
          cursorValue: decodedCursor.value,
        });
      } else {
        qb.andWhere('bookmark.createdAt > :cursorValue', {
          cursorValue: decodedCursor.value,
        });
      }
    }

    qb.orderBy('bookmark.createdAt', sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor({ value: items[items.length - 1].createdAt })
        : undefined;

    const result: PaginatedResponse<Bookmark> = {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };

    return {
      status: 'success',
      message: 'Bookmarks retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async create(
    userId: string,
    postId: string,
  ): Promise<ApiResponse<Bookmark>> {
    // Verify the post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    // Check for duplicate bookmark
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, postId },
    });
    if (existing) {
      throw new ConflictException('Post is already bookmarked');
    }

    const bookmark = this.bookmarkRepository.create({ userId, postId });
    const saved = await this.bookmarkRepository.save(bookmark);

    // Reload with relations
    const result = await this.bookmarkRepository.findOne({
      where: { id: saved.id },
      relations: ['post', 'post.author', 'post.category'],
    });

    this.logger.debug(`User ${userId} bookmarked post ${postId}`);

    return {
      status: 'success',
      message: 'Post bookmarked successfully',
      data: result!,
    };
  }

  async remove(
    userId: string,
    postId: string,
  ): Promise<ApiResponse<null>> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, postId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarkRepository.remove(bookmark);

    this.logger.debug(`User ${userId} removed bookmark for post ${postId}`);

    return {
      status: 'success',
      message: 'Bookmark removed successfully',
      data: null,
    };
  }

  async isBookmarked(
    userId: string,
    postId: string,
  ): Promise<ApiResponse<{ bookmarked: boolean }>> {
    const exists = await this.bookmarkRepository.findOne({
      where: { userId, postId },
    });

    return {
      status: 'success',
      message: 'Bookmark status retrieved',
      data: { bookmarked: !!exists },
    };
  }

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
