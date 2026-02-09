import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';
import { SearchQuery } from './entities/search-query.entity';
import { SearchQueryDto, SuggestionsQueryDto } from './dto/search-query.dto';
import {
  SearchResultDto,
  SearchResultItemDto,
  SearchSuggestionDto,
  PopularSearchDto,
} from './dto/search-response.dto';
import { ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(SearchQuery)
    private readonly searchQueryRepository: Repository<SearchQuery>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Full-text search across blog posts using PostgreSQL tsvector/tsquery.
   * Supports filtering by category, tag, author, and date range.
   * Returns relevance-ranked results with highlighted snippets.
   */
  async search(
    query: SearchQueryDto,
    userId?: string,
  ): Promise<ApiResponse<SearchResultDto>> {
    const {
      q,
      category,
      tag,
      author,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = query;

    const offset = (page - 1) * limit;

    // Build the full-text search query using PostgreSQL tsvector and tsquery
    const qb = this.dataSource
      .createQueryBuilder()
      .select('post.id', 'id')
      .addSelect('post.title', 'title')
      .addSelect('post.slug', 'slug')
      .addSelect('post.excerpt', 'excerpt')
      .addSelect('post.featured_image', 'featuredImage')
      .addSelect('post.published_at', 'publishedAt')
      .addSelect(
        `ts_rank(
          setweight(to_tsvector('english', COALESCE(post.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(post.excerpt, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(post.content, '')), 'C'),
          plainto_tsquery('english', :q)
        )`,
        'rank',
      )
      .addSelect(
        `ts_headline(
          'english',
          COALESCE(post.content, post.excerpt, ''),
          plainto_tsquery('english', :q),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=60, MinWords=20, MaxFragments=2'
        )`,
        'headline',
      )
      .addSelect('author.first_name || \' \' || author.last_name', 'authorName')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.slug', 'categorySlug')
      .from('posts', 'post')
      .leftJoin('users', 'author', 'author.id = post.author_id')
      .leftJoin('blog_categories', 'category', 'category.id = post.category_id')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.deleted_at IS NULL')
      .andWhere(
        `(
          to_tsvector('english', COALESCE(post.title, '')) ||
          to_tsvector('english', COALESCE(post.excerpt, '')) ||
          to_tsvector('english', COALESCE(post.content, ''))
        ) @@ plainto_tsquery('english', :q)`,
      )
      .setParameter('q', q);

    // Apply optional filters
    if (category) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    if (tag) {
      qb.innerJoin('post_tags', 'pt', 'pt.post_id = post.id')
        .innerJoin('blog_tags', 'bt', 'bt.id = pt.tag_id')
        .andWhere('bt.slug = :tagSlug', { tagSlug: tag });
    }

    if (author) {
      qb.andWhere('post.author_id = :authorId', { authorId: author });
    }

    if (dateFrom) {
      qb.andWhere('post.published_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('post.published_at <= :dateTo', { dateTo });
    }

    // Get total count
    const countQb = qb.clone();
    const totalResult = await countQb
      .select('COUNT(*)', 'count')
      // Remove rank/headline selects from count query
      .orderBy()
      .getRawOne();
    const total = parseInt(totalResult?.count ?? '0', 10);

    // Get paginated, ranked results
    const results = await qb
      .orderBy('rank', 'DESC')
      .addOrderBy('post.published_at', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    const items: SearchResultItemDto[] = results.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      headline: row.headline,
      rank: parseFloat(row.rank),
      featuredImage: row.featuredImage,
      authorName: row.authorName?.trim() || undefined,
      categoryName: row.categoryName || undefined,
      categorySlug: row.categorySlug || undefined,
      publishedAt: row.publishedAt,
    }));

    // Track the search query asynchronously
    this.trackSearchQuery(q, total, userId).catch((err) => {
      this.logger.warn(`Failed to track search query: ${err.message}`);
    });

    const searchResult: SearchResultDto = {
      items,
      total,
      page,
      limit,
      hasNextPage: offset + limit < total,
      query: q,
    };

    return {
      status: 'success',
      message: `Found ${total} results for "${q}"`,
      data: searchResult,
    };
  }

  /**
   * Autocomplete suggestions that return post titles matching a prefix.
   */
  async suggestions(
    query: SuggestionsQueryDto,
  ): Promise<ApiResponse<SearchSuggestionDto[]>> {
    const { q } = query;

    const results = await this.postRepository
      .createQueryBuilder('post')
      .select(['post.title', 'post.slug'])
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.title ILIKE :prefix', { prefix: `${q}%` })
      .orderBy('post.views', 'DESC')
      .take(8)
      .getMany();

    const suggestions: SearchSuggestionDto[] = results.map((post) => ({
      title: post.title,
      slug: post.slug,
    }));

    return {
      status: 'success',
      message: 'Suggestions retrieved successfully',
      data: suggestions,
    };
  }

  /**
   * Return the most popular search terms based on tracked queries.
   */
  async popularSearches(): Promise<ApiResponse<PopularSearchDto[]>> {
    const results = await this.searchQueryRepository
      .createQueryBuilder('sq')
      .select('LOWER(sq.query)', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('LOWER(sq.query)')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const popular: PopularSearchDto[] = results.map((row) => ({
      query: row.query,
      count: parseInt(row.count, 10),
    }));

    return {
      status: 'success',
      message: 'Popular searches retrieved successfully',
      data: popular,
    };
  }

  /**
   * Track a search query for popular terms analytics.
   */
  private async trackSearchQuery(
    query: string,
    resultCount: number,
    userId?: string,
  ): Promise<void> {
    const searchQuery = this.searchQueryRepository.create({
      query,
      resultCount,
      userId: userId || undefined,
    });
    await this.searchQueryRepository.save(searchQuery);
  }
}
