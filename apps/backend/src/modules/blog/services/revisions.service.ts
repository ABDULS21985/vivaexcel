import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostRevision } from '../../../entities/post-revision.entity';
import { Post } from '../../../entities/post.entity';
import { BlogRepository } from '../blog.repository';
import { ApiResponse, PaginatedResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';
import { DiffEntry } from '../dto/revision-response.dto';

const CACHE_TTL_REVISIONS = 300; // 5 minutes
const CACHE_TAG_REVISIONS = 'revisions';

@Injectable()
export class RevisionsService {
  private readonly logger = new Logger(RevisionsService.name);

  constructor(
    @InjectRepository(PostRevision)
    private readonly revisionRepository: Repository<PostRevision>,
    private readonly blogRepository: BlogRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a revision snapshot of the current post state.
   * Typically called automatically before a post update.
   */
  async createRevision(
    postId: string,
    userId: string,
    changeDescription?: string,
  ): Promise<ApiResponse<PostRevision>> {
    const post = await this.blogRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    // Determine the next revision number
    const lastRevision = await this.revisionRepository.findOne({
      where: { postId },
      order: { revisionNumber: 'DESC' },
    });
    const revisionNumber = (lastRevision?.revisionNumber ?? 0) + 1;

    const revision = this.revisionRepository.create({
      postId,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      revisionNumber,
      changeDescription,
      createdBy: userId,
    });

    const saved = await this.revisionRepository.save(revision);

    // Invalidate revisions cache for this post
    await this.cacheService.invalidateByTag(`revisions:${postId}`);
    this.logger.debug(
      `Created revision #${revisionNumber} for post ${postId}`,
    );

    return {
      status: 'success',
      message: 'Revision created successfully',
      data: saved,
    };
  }

  /**
   * List all revisions for a post with cursor-based pagination.
   */
  async getRevisions(
    postId: string,
    options?: { cursor?: string; limit?: number },
  ): Promise<ApiResponse<PaginatedResponse<PostRevision>>> {
    const limit = options?.limit ?? 20;
    const cacheKey = this.cacheService.generateKey(
      'revisions',
      postId,
      options?.cursor ?? 'first',
      String(limit),
    );

    const result = await this.cacheService.wrap(
      cacheKey,
      async () => {
        // Verify the post exists
        const post = await this.blogRepository.findPostById(postId);
        if (!post) {
          throw new NotFoundException(`Post with ID "${postId}" not found`);
        }

        const qb = this.revisionRepository
          .createQueryBuilder('revision')
          .leftJoinAndSelect('revision.creator', 'creator')
          .where('revision.postId = :postId', { postId })
          .orderBy('revision.revisionNumber', 'DESC')
          .take(limit + 1);

        if (options?.cursor) {
          const cursorData = this.decodeCursor(options.cursor);
          qb.andWhere('revision.revisionNumber < :cursorValue', {
            cursorValue: cursorData.value,
          });
        }

        const items = await qb.getMany();
        const hasNextPage = items.length > limit;

        if (hasNextPage) {
          items.pop();
        }

        const nextCursor =
          hasNextPage && items.length > 0
            ? this.encodeCursor({
                value: items[items.length - 1].revisionNumber,
              })
            : undefined;

        return {
          items,
          meta: {
            hasNextPage,
            hasPreviousPage: !!options?.cursor,
            nextCursor,
            previousCursor: options?.cursor,
          },
        };
      },
      { ttl: CACHE_TTL_REVISIONS, tags: [CACHE_TAG_REVISIONS, `revisions:${postId}`] },
    );

    return {
      status: 'success',
      message: 'Revisions retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  /**
   * Get a specific revision by ID.
   */
  async getRevision(revisionId: string): Promise<ApiResponse<PostRevision>> {
    const revision = await this.revisionRepository.findOne({
      where: { id: revisionId },
      relations: ['creator'],
    });

    if (!revision) {
      throw new NotFoundException(
        `Revision with ID "${revisionId}" not found`,
      );
    }

    return {
      status: 'success',
      message: 'Revision retrieved successfully',
      data: revision,
    };
  }

  /**
   * Restore a post to a previous revision state.
   * This creates a new revision snapshot of the current state first,
   * then applies the old revision's content to the post.
   */
  async restoreRevision(
    postId: string,
    revisionId: string,
    userId: string,
  ): Promise<ApiResponse<Post>> {
    const post = await this.blogRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    const revision = await this.revisionRepository.findOne({
      where: { id: revisionId, postId },
    });

    if (!revision) {
      throw new NotFoundException(
        `Revision with ID "${revisionId}" not found for post "${postId}"`,
      );
    }

    // Create a snapshot of the current state before restoring
    await this.createRevision(
      postId,
      userId,
      `Auto-snapshot before restoring to revision #${revision.revisionNumber}`,
    );

    // Apply the revision content to the post
    const updatedPost = await this.blogRepository.updatePost(postId, {
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt,
    });

    // Invalidate caches
    await this.cacheService.invalidateByTags([
      'posts',
      `post:${postId}`,
      `revisions:${postId}`,
    ]);

    this.logger.log(
      `Post ${postId} restored to revision #${revision.revisionNumber} by user ${userId}`,
    );

    return {
      status: 'success',
      message: `Post restored to revision #${revision.revisionNumber}`,
      data: updatedPost!,
    };
  }

  /**
   * Return a simple line-by-line diff between two revisions.
   */
  async diffRevisions(
    revisionId1: string,
    revisionId2: string,
  ): Promise<
    ApiResponse<{
      revision1: PostRevision;
      revision2: PostRevision;
      titleDiff: DiffEntry[];
      contentDiff: DiffEntry[];
      excerptDiff: DiffEntry[];
    }>
  > {
    const [rev1, rev2] = await Promise.all([
      this.revisionRepository.findOne({
        where: { id: revisionId1 },
        relations: ['creator'],
      }),
      this.revisionRepository.findOne({
        where: { id: revisionId2 },
        relations: ['creator'],
      }),
    ]);

    if (!rev1) {
      throw new NotFoundException(
        `Revision with ID "${revisionId1}" not found`,
      );
    }
    if (!rev2) {
      throw new NotFoundException(
        `Revision with ID "${revisionId2}" not found`,
      );
    }

    if (rev1.postId !== rev2.postId) {
      throw new BadRequestException(
        'Cannot diff revisions from different posts',
      );
    }

    const titleDiff = this.computeSimpleDiff(rev1.title, rev2.title);
    const contentDiff = this.computeSimpleDiff(
      rev1.content ?? '',
      rev2.content ?? '',
    );
    const excerptDiff = this.computeSimpleDiff(
      rev1.excerpt ?? '',
      rev2.excerpt ?? '',
    );

    return {
      status: 'success',
      message: 'Revision diff computed successfully',
      data: {
        revision1: rev1,
        revision2: rev2,
        titleDiff,
        contentDiff,
        excerptDiff,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Simple line-based diff between two strings.
   * Splits by newline and compares each line.
   */
  private computeSimpleDiff(text1: string, text2: string): DiffEntry[] {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const diff: DiffEntry[] = [];

    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined && line2 !== undefined) {
        diff.push({ type: 'added', value: line2 });
      } else if (line1 !== undefined && line2 === undefined) {
        diff.push({ type: 'removed', value: line1 });
      } else if (line1 !== line2) {
        diff.push({ type: 'removed', value: line1 });
        diff.push({ type: 'added', value: line2 });
      } else {
        diff.push({ type: 'unchanged', value: line1 });
      }
    }

    return diff;
  }

  private encodeCursor(data: { value: unknown }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: number } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: 0 };
    }
  }
}
