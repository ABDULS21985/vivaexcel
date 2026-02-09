import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogRepository } from '../blog.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { Post, PostStatus, PostVisibility, MembershipTierLevel } from '../../../entities/post.entity';
import { ReadingHistory } from '../../../entities/reading-history.entity';
import { PostRevision } from '../../../entities/post-revision.entity';
import { PaginatedResponse, ApiResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';
import { MembershipService } from '../../membership/membership.service';

// Cache constants
const CACHE_TTL_POSTS_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE_POST = 600; // 10 minutes
const CACHE_TAG_POSTS = 'posts';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly cacheService: CacheService,
    private readonly membershipService: MembershipService,
    @InjectRepository(ReadingHistory)
    private readonly readingHistoryRepository: Repository<ReadingHistory>,
    @InjectRepository(PostRevision)
    private readonly revisionRepository: Repository<PostRevision>,
  ) {}

  async findAll(query: PostQueryDto): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const cacheKey = this.cacheService.generateKey('posts', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.blogRepository.findAllPosts(query),
      { ttl: CACHE_TTL_POSTS_LIST, tags: [CACHE_TAG_POSTS] },
    );

    return {
      status: 'success',
      message: 'Posts retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string, userId?: string | null): Promise<ApiResponse<Post & { paywalled?: boolean }>> {
    const cacheKey = this.cacheService.generateKey('posts', 'id', id);

    const post = await this.cacheService.wrap(
      cacheKey,
      () => this.blogRepository.findPostById(id),
      { ttl: CACHE_TTL_SINGLE_POST, tags: [CACHE_TAG_POSTS, `post:${id}`] },
    );

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    // Increment views (don't await to not block response)
    this.blogRepository.incrementViews(id).catch((err) => {
      this.logger.warn(`Failed to increment views for post ${id}: ${err.message}`);
    });

    // Record reading history
    this.recordReadingHistory(userId ?? undefined, post.id).catch((err) => {
      this.logger.warn(`Failed to record reading history: ${err.message}`);
    });

    // Apply content gating
    const gatedPost = await this.applyContentGating(post, userId);

    return {
      status: 'success',
      message: 'Post retrieved successfully',
      data: gatedPost,
    };
  }

  async findBySlug(slug: string, userId?: string | null): Promise<ApiResponse<Post & { paywalled?: boolean }>> {
    const cacheKey = this.cacheService.generateKey('posts', 'slug', slug);

    const post = await this.cacheService.wrap(
      cacheKey,
      () => this.blogRepository.findPostBySlug(slug),
      { ttl: CACHE_TTL_SINGLE_POST, tags: [CACHE_TAG_POSTS, `post:slug:${slug}`] },
    );

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Increment views (don't await to not block response)
    this.blogRepository.incrementViews(post.id).catch((err) => {
      this.logger.warn(`Failed to increment views for post ${slug}: ${err.message}`);
    });

    // Record reading history
    this.recordReadingHistory(userId ?? undefined, post.id).catch((err) => {
      this.logger.warn(`Failed to record reading history: ${err.message}`);
    });

    // Apply content gating
    const gatedPost = await this.applyContentGating(post, userId);

    return {
      status: 'success',
      message: 'Post retrieved successfully',
      data: gatedPost,
    };
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<ApiResponse<Post>> {
    // Check if slug already exists
    const slugExists = await this.blogRepository.postSlugExists(createPostDto.slug);
    if (slugExists) {
      throw new ConflictException('Post slug already exists');
    }

    const { tagIds, scheduledAt, ...postData } = createPostDto;

    // Calculate reading time and word count (roughly 200 words per minute)
    let readingTime: number | undefined;
    let wordCount = 0;
    if (postData.content) {
      wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Handle scheduling and publishing
    let publishedAt: Date | undefined;
    if (postData.status === PostStatus.PUBLISHED) {
      publishedAt = new Date();
    }

    const post = await this.blogRepository.createPost(
      {
        ...postData,
        authorId,
        readingTime,
        wordCount,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
      tagIds,
    );

    // Invalidate posts cache
    await this.cacheService.invalidateByTag(CACHE_TAG_POSTS);
    this.logger.debug('Invalidated posts cache after create');

    return {
      status: 'success',
      message: 'Post created successfully',
      data: post,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId?: string): Promise<ApiResponse<Post>> {
    const existingPost = await this.blogRepository.findPostById(id);
    if (!existingPost) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    // Create a revision snapshot of the current state before editing
    await this.createRevisionSnapshot(existingPost, userId);

    // Check if new slug already exists (if updating slug)
    if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
      const slugExists = await this.blogRepository.postSlugExists(updatePostDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Post slug already exists');
      }
    }

    const { tagIds, scheduledAt, ...postData } = updatePostDto;

    // Recalculate reading time and word count if content changed
    let readingTime = existingPost.readingTime;
    let wordCount = existingPost.wordCount;
    if (postData.content) {
      wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Handle status changes
    let publishedAt = existingPost.publishedAt;
    if (postData.status === PostStatus.PUBLISHED && !existingPost.publishedAt) {
      publishedAt = new Date();
    }

    const updatedPost = await this.blogRepository.updatePost(
      id,
      {
        ...postData,
        readingTime,
        wordCount,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingPost.scheduledAt,
      },
      tagIds,
    );

    // Invalidate posts cache and specific post cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_POSTS,
      `post:${id}`,
      `post:slug:${existingPost.slug}`,
    ]);
    this.logger.debug(`Invalidated posts cache after update for post ${id}`);

    return {
      status: 'success',
      message: 'Post updated successfully',
      data: updatedPost!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const post = await this.blogRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    await this.blogRepository.softDeletePost(id);

    // Invalidate posts cache and specific post cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_POSTS,
      `post:${id}`,
      `post:slug:${post.slug}`,
    ]);
    this.logger.debug(`Invalidated posts cache after delete for post ${id}`);

    return {
      status: 'success',
      message: 'Post deleted successfully',
      data: null,
    };
  }

  async publish(id: string): Promise<ApiResponse<Post>> {
    const post = await this.blogRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    const updatedPost = await this.blogRepository.updatePost(id, {
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    // Invalidate posts cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_POSTS,
      `post:${id}`,
      `post:slug:${post.slug}`,
    ]);
    this.logger.debug(`Invalidated posts cache after publish for post ${id}`);

    return {
      status: 'success',
      message: 'Post published successfully',
      data: updatedPost!,
    };
  }

  async unpublish(id: string): Promise<ApiResponse<Post>> {
    const post = await this.blogRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    const updatedPost = await this.blogRepository.updatePost(id, {
      status: PostStatus.DRAFT,
    });

    // Invalidate posts cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_POSTS,
      `post:${id}`,
      `post:slug:${post.slug}`,
    ]);
    this.logger.debug(`Invalidated posts cache after unpublish for post ${id}`);

    return {
      status: 'success',
      message: 'Post unpublished successfully',
      data: updatedPost!,
    };
  }

  // ──────────────────────────────────────────────
  //  Content gating
  // ──────────────────────────────────────────────

  /**
   * Apply content gating to a post based on its visibility and the user's
   * subscription tier. If the user does not have sufficient access, the
   * content is truncated to the first 3 paragraphs and a `paywalled` flag
   * is set to `true`.
   */
  private async applyContentGating(
    post: Post,
    userId?: string | null,
  ): Promise<Post & { paywalled?: boolean }> {
    // Public posts are always fully visible
    if (post.visibility === PostVisibility.PUBLIC) {
      return { ...post, paywalled: false };
    }

    // If the user is not authenticated, gate the content
    if (!userId) {
      return this.truncatePost(post);
    }

    // For "members" visibility, any authenticated user with at least free tier has access
    if (post.visibility === PostVisibility.MEMBERS) {
      return { ...post, paywalled: false };
    }

    // For "paid" visibility, check the user's subscription tier
    if (post.visibility === PostVisibility.PAID) {
      const requiredTier = post.minimumTier ?? MembershipTierLevel.BASIC;
      const hasAccess = await this.membershipService.userHasTierAccess(
        userId,
        requiredTier,
      );

      if (hasAccess) {
        return { ...post, paywalled: false };
      }

      return this.truncatePost(post);
    }

    return { ...post, paywalled: false };
  }

  /**
   * Return a copy of the post with only the first 3 paragraphs of content
   * and the `paywalled` flag set to `true`. Also includes gating metadata
   * so the frontend can display subscription prompts.
   */
  private truncatePost(
    post: Post,
  ): Post & { paywalled: boolean; gated: boolean; requiresSubscription: boolean; minimumTier?: MembershipTierLevel } {
    let truncatedContent = post.content ?? '';

    if (truncatedContent) {
      // Split on double newlines or HTML paragraph boundaries
      const paragraphs = truncatedContent
        .split(/(?:<\/p>\s*<p[^>]*>)|(?:\n\s*\n)/)
        .filter((p) => p.trim().length > 0);

      if (paragraphs.length > 3) {
        truncatedContent = paragraphs.slice(0, 3).join('</p><p>');
        // Ensure opening and closing tags are present
        if (!truncatedContent.startsWith('<p')) {
          truncatedContent = '<p>' + truncatedContent;
        }
        if (!truncatedContent.endsWith('</p>')) {
          truncatedContent = truncatedContent + '</p>';
        }
      }
    }

    return {
      ...post,
      content: truncatedContent,
      paywalled: true,
      gated: true,
      requiresSubscription: post.visibility === PostVisibility.PAID,
      minimumTier: post.visibility === PostVisibility.PAID
        ? (post.minimumTier ?? MembershipTierLevel.BASIC)
        : undefined,
    };
  }

  // ──────────────────────────────────────────────
  //  Revision snapshots
  // ──────────────────────────────────────────────

  /**
   * Create a revision snapshot of the post's current state before an update.
   * This is called automatically from `update()`.
   */
  private async createRevisionSnapshot(
    post: Post,
    userId?: string,
  ): Promise<void> {
    try {
      // Determine the next revision number for this post
      const lastRevision = await this.revisionRepository.findOne({
        where: { postId: post.id },
        order: { revisionNumber: 'DESC' },
      });
      const revisionNumber = (lastRevision?.revisionNumber ?? 0) + 1;

      const revision = this.revisionRepository.create({
        postId: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        revisionNumber,
        changeDescription: 'Auto-snapshot before update',
        createdBy: userId ?? post.authorId,
      });

      await this.revisionRepository.save(revision);
      this.logger.debug(
        `Created auto-revision #${revisionNumber} for post ${post.id}`,
      );
    } catch (err) {
      // Don't block the update if revision creation fails
      this.logger.warn(
        `Failed to create revision snapshot for post ${post.id}: ${(err as Error).message}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Reading history
  // ──────────────────────────────────────────────

  private async recordReadingHistory(
    userId: string | undefined,
    postId: string,
  ): Promise<void> {
    const entry = this.readingHistoryRepository.create({
      userId: userId ?? undefined,
      postId,
      readPercentage: 0,
      readAt: new Date(),
    });
    await this.readingHistoryRepository.save(entry);
  }
}
