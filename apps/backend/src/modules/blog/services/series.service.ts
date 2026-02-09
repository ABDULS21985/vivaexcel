import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PostSeries } from '../../../entities/post-series.entity';
import { Post } from '../../../entities/post.entity';
import { CreateSeriesDto } from '../dto/create-series.dto';
import { UpdateSeriesDto } from '../dto/update-series.dto';
import { ApiResponse, PaginatedResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';

const CACHE_TTL_SERIES = 300; // 5 minutes
const CACHE_TAG_SERIES = 'series';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(
    @InjectRepository(PostSeries)
    private readonly seriesRepository: Repository<PostSeries>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * List all series with cursor-based pagination.
   */
  async findAll(options?: {
    cursor?: string;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<PostSeries>>> {
    const limit = options?.limit ?? 20;
    const cacheKey = this.cacheService.generateKey(
      'series',
      'list',
      options?.cursor ?? 'first',
      String(limit),
    );

    const result = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const qb = this.seriesRepository
          .createQueryBuilder('series')
          .leftJoinAndSelect('series.creator', 'creator')
          .orderBy('series.createdAt', 'DESC')
          .take(limit + 1);

        if (options?.cursor) {
          const cursorData = this.decodeCursor(options.cursor);
          qb.andWhere('series.createdAt < :cursorValue', {
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
                value: items[items.length - 1].createdAt.toISOString(),
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
      { ttl: CACHE_TTL_SERIES, tags: [CACHE_TAG_SERIES] },
    );

    return {
      status: 'success',
      message: 'Series retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  /**
   * Get a single series with all its posts ordered by seriesOrder.
   */
  async getSeriesWithPosts(slug: string): Promise<ApiResponse<PostSeries>> {
    const cacheKey = this.cacheService.generateKey('series', 'slug', slug);

    const series = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const found = await this.seriesRepository
          .createQueryBuilder('series')
          .leftJoinAndSelect('series.creator', 'creator')
          .leftJoinAndSelect('series.posts', 'posts')
          .leftJoinAndSelect('posts.author', 'author')
          .leftJoinAndSelect('posts.category', 'category')
          .leftJoinAndSelect('posts.tags', 'tags')
          .where('series.slug = :slug', { slug })
          .orderBy('posts.seriesOrder', 'ASC')
          .getOne();

        return found;
      },
      { ttl: CACHE_TTL_SERIES, tags: [CACHE_TAG_SERIES, `series:slug:${slug}`] },
    );

    if (!series) {
      throw new NotFoundException(`Series with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Series retrieved successfully',
      data: series,
    };
  }

  /**
   * Get a series by ID.
   */
  async findById(id: string): Promise<ApiResponse<PostSeries>> {
    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ['creator', 'posts'],
    });

    if (!series) {
      throw new NotFoundException(`Series with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Series retrieved successfully',
      data: series,
    };
  }

  /**
   * Create a new series.
   */
  async create(
    dto: CreateSeriesDto,
    userId: string,
  ): Promise<ApiResponse<PostSeries>> {
    // Check for duplicate slug
    const existing = await this.seriesRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(
        `Series with slug "${dto.slug}" already exists`,
      );
    }

    const series = this.seriesRepository.create({
      ...dto,
      createdBy: userId,
    });

    const saved = await this.seriesRepository.save(series);

    // Invalidate series cache
    await this.cacheService.invalidateByTag(CACHE_TAG_SERIES);
    this.logger.debug(`Created series "${saved.title}" (${saved.slug})`);

    return {
      status: 'success',
      message: 'Series created successfully',
      data: saved,
    };
  }

  /**
   * Update an existing series.
   */
  async update(
    id: string,
    dto: UpdateSeriesDto,
  ): Promise<ApiResponse<PostSeries>> {
    const series = await this.seriesRepository.findOne({
      where: { id },
    });

    if (!series) {
      throw new NotFoundException(`Series with ID "${id}" not found`);
    }

    // Check for slug conflict if updating slug
    if (dto.slug && dto.slug !== series.slug) {
      const existing = await this.seriesRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(
          `Series with slug "${dto.slug}" already exists`,
        );
      }
    }

    Object.assign(series, dto);
    const saved = await this.seriesRepository.save(series);

    // Invalidate series cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_SERIES,
      `series:slug:${series.slug}`,
    ]);
    this.logger.debug(`Updated series "${saved.title}" (${saved.id})`);

    return {
      status: 'success',
      message: 'Series updated successfully',
      data: saved,
    };
  }

  /**
   * Soft-delete a series. Posts in the series are NOT deleted; their
   * seriesId is set to null.
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!series) {
      throw new NotFoundException(`Series with ID "${id}" not found`);
    }

    // Detach all posts from the series
    if (series.posts && series.posts.length > 0) {
      const postIds = series.posts.map((p) => p.id);
      await this.postRepository
        .createQueryBuilder()
        .update(Post)
        .set({ seriesId: undefined, seriesOrder: undefined })
        .where('id IN (:...postIds)', { postIds })
        .execute();
    }

    await this.seriesRepository.softDelete(id);

    // Invalidate caches
    await this.cacheService.invalidateByTags([
      CACHE_TAG_SERIES,
      'posts',
      `series:slug:${series.slug}`,
    ]);
    this.logger.debug(`Deleted series "${series.title}" (${id})`);

    return {
      status: 'success',
      message: 'Series deleted successfully',
      data: null,
    };
  }

  /**
   * Add a post to a series at a specified order position.
   */
  async addPostToSeries(
    seriesId: string,
    postId: string,
    order?: number,
  ): Promise<ApiResponse<Post>> {
    const series = await this.seriesRepository.findOne({
      where: { id: seriesId },
      relations: ['posts'],
    });

    if (!series) {
      throw new NotFoundException(`Series with ID "${seriesId}" not found`);
    }

    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    // If already in this series, just update the order
    if (post.seriesId && post.seriesId === seriesId && !order) {
      return {
        status: 'success',
        message: 'Post is already in this series',
        data: post,
      };
    }

    // Determine the order position
    let seriesOrder = order;
    if (!seriesOrder) {
      // Place at the end
      const maxOrder = series.posts?.reduce(
        (max, p) => Math.max(max, p.seriesOrder ?? 0),
        0,
      ) ?? 0;
      seriesOrder = maxOrder + 1;
    }

    post.seriesId = seriesId;
    post.seriesOrder = seriesOrder;

    const saved = await this.postRepository.save(post);

    // Invalidate caches
    await this.cacheService.invalidateByTags([
      CACHE_TAG_SERIES,
      'posts',
      `post:${postId}`,
      `series:slug:${series.slug}`,
    ]);
    this.logger.debug(
      `Added post ${postId} to series ${seriesId} at position ${seriesOrder}`,
    );

    return {
      status: 'success',
      message: 'Post added to series successfully',
      data: saved,
    };
  }

  /**
   * Reorder posts in a series. The `postIds` array defines the new order.
   */
  async reorderPosts(
    seriesId: string,
    postIds: string[],
  ): Promise<ApiResponse<PostSeries>> {
    const series = await this.seriesRepository.findOne({
      where: { id: seriesId },
      relations: ['posts'],
    });

    if (!series) {
      throw new NotFoundException(`Series with ID "${seriesId}" not found`);
    }

    // Validate that all provided post IDs belong to this series
    const existingPostIds = new Set(
      (series.posts ?? []).map((p) => p.id),
    );

    for (const pid of postIds) {
      if (!existingPostIds.has(pid)) {
        throw new BadRequestException(
          `Post "${pid}" is not part of series "${seriesId}"`,
        );
      }
    }

    // Update the order for each post
    const updatePromises = postIds.map((pid, index) =>
      this.postRepository.update(pid, { seriesOrder: index + 1 }),
    );

    await Promise.all(updatePromises);

    // Reload the series with updated posts
    const updatedSeries = await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.posts', 'posts')
      .leftJoinAndSelect('series.creator', 'creator')
      .leftJoinAndSelect('posts.author', 'author')
      .where('series.id = :id', { id: seriesId })
      .orderBy('posts.seriesOrder', 'ASC')
      .getOne();

    // Invalidate caches
    await this.cacheService.invalidateByTags([
      CACHE_TAG_SERIES,
      'posts',
      `series:slug:${series.slug}`,
    ]);
    this.logger.debug(
      `Reordered ${postIds.length} posts in series ${seriesId}`,
    );

    return {
      status: 'success',
      message: 'Series posts reordered successfully',
      data: updatedSeries!,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private encodeCursor(data: { value: unknown }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: string } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: '' };
    }
  }
}
