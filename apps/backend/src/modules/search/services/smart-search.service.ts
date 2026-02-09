import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../shared/redis/redis.service';
import {
  DigitalProduct,
  DigitalProductStatus,
} from '../../../entities/digital-product.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_PREFIX = 'smart_search';
const INTENT_CACHE_TTL = 3600; // 1 hour
const AUTOCOMPLETE_CACHE_TTL = 300; // 5 minutes

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface SearchIntent {
  originalQuery: string;
  normalizedQuery: string;
  category?: string;
  productType?: string;
  priceRange?: { min?: number; max?: number };
  sortPreference?:
    | 'price_asc'
    | 'price_desc'
    | 'rating'
    | 'newest'
    | 'popular';
  features?: string[];
  correctedQuery?: string;
  isNaturalLanguage: boolean;
}

export interface SmartSearchResult {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  type: string;
  relevanceScore: number;
}

export interface SmartSearchResponse {
  items: SmartSearchResult[];
  intent: SearchIntent;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  didYouMean?: string;
  relatedSearches: string[];
}

export interface AutocompleteItem {
  text: string;
  type: 'product' | 'category' | 'suggestion' | 'recent';
  productId?: string;
  slug?: string;
  featuredImage?: string;
  price?: number;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class SmartSearchService {
  private readonly logger = new Logger(SmartSearchService.name);

  constructor(
    private readonly redis: RedisService,
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  AI Intent Extraction
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Analyse an incoming search query and extract structured intent.
   * Simple keyword queries are handled locally; longer / natural-language
   * queries are sent to the Anthropic API for intent extraction.
   * Results are cached in Redis for INTENT_CACHE_TTL seconds.
   */
  async extractIntent(query: string): Promise<SearchIntent> {
    const trimmed = query.trim();
    const cacheKey = `${CACHE_PREFIX}:intent:${trimmed.toLowerCase()}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Heuristic: if the query is short or looks like plain keywords, skip AI
    const isNaturalLanguage =
      trimmed.split(/\s+/).length > 3 ||
      /(?:show|find|looking|need|want|best|cheap|under|between|affordable|top|rated)/i.test(
        trimmed,
      );

    if (!isNaturalLanguage) {
      const intent: SearchIntent = {
        originalQuery: query,
        normalizedQuery: trimmed.toLowerCase(),
        isNaturalLanguage: false,
      };
      await this.redis.set(cacheKey, JSON.stringify(intent), INTENT_CACHE_TTL);
      return intent;
    }

    // Natural-language query -- delegate to AI
    try {
      const intent = await this.extractIntentWithAI(trimmed);
      await this.redis.set(cacheKey, JSON.stringify(intent), INTENT_CACHE_TTL);
      return intent;
    } catch (error) {
      this.logger.warn(
        `AI intent extraction failed, falling back to keyword search: ${error}`,
      );
      const fallback: SearchIntent = {
        originalQuery: query,
        normalizedQuery: trimmed.toLowerCase(),
        isNaturalLanguage: true,
      };
      return fallback;
    }
  }

  /**
   * Call the Anthropic API to extract structured intent from a natural
   * language search query.  The model returns a single JSON object that is
   * parsed and merged into a SearchIntent.
   */
  private async extractIntentWithAI(query: string): Promise<SearchIntent> {
    // Dynamic import -- avoids hard dependency when AI is not configured
    const Anthropic = require('@anthropic-ai/sdk');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException('AI features are not configured');
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a search intent extraction engine for VivaExcel, a digital products marketplace.

Product types available: powerpoint, document, web_template, startup_kit, solution_template, design_system, code_template, other

Extract the user's search intent and return ONLY a JSON object with these fields:
- normalizedQuery: string (cleaned search keywords for full-text search)
- category: string or null (if user mentions a category)
- productType: string or null (one of the product types above if mentioned)
- priceRange: { min?: number, max?: number } or null
- sortPreference: "price_asc" | "price_desc" | "rating" | "newest" | "popular" or null
- features: string[] (specific features or requirements mentioned)
- correctedQuery: string or null (if there are obvious typos, provide the corrected version)

Return ONLY the JSON object, no other text.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Extract intent from: "${query}"` }],
    });

    const textBlock = response.content.find(
      (block: any) => block.type === 'text',
    );
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text block in AI response');
    }

    // Strip optional markdown fences around the JSON
    const raw = (textBlock as { type: 'text'; text: string }).text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(raw);

    return {
      originalQuery: query,
      normalizedQuery: parsed.normalizedQuery || query.toLowerCase().trim(),
      category: parsed.category || undefined,
      productType: parsed.productType || undefined,
      priceRange: parsed.priceRange || undefined,
      sortPreference: parsed.sortPreference || undefined,
      features: parsed.features || [],
      correctedQuery: parsed.correctedQuery || undefined,
      isNaturalLanguage: true,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Smart Product Search
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Perform a smart search against the digital_products table.
   *
   * 1. Extracts structured intent (AI or heuristic).
   * 2. Builds a PostgreSQL full-text query with weighted ranking.
   * 3. Applies intent-driven filters (type, category, price range).
   * 4. Returns paginated results with relevance scores.
   */
  async smartSearch(
    query: string,
    page: number = 1,
    limit: number = 12,
    userId?: string,
  ): Promise<ApiResponse<SmartSearchResponse>> {
    const intent = await this.extractIntent(query);
    const searchQuery = intent.correctedQuery || intent.normalizedQuery;
    const offset = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('dp')
      .where('dp.status = :status', { status: DigitalProductStatus.PUBLISHED });

    // ── Full-text search ────────────────────────────────────────────────
    if (searchQuery) {
      qb.andWhere(
        `(
          to_tsvector('english', COALESCE(dp.title, '')) ||
          to_tsvector('english', COALESCE(dp.description, '')) ||
          to_tsvector('english', COALESCE(dp.short_description, ''))
        ) @@ plainto_tsquery('english', :q)`,
        { q: searchQuery },
      );

      // Weighted relevance score: title (A) > short_description (B) > description (C)
      qb.addSelect(
        `ts_rank(
          setweight(to_tsvector('english', COALESCE(dp.title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(dp.short_description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(dp.description, '')), 'C'),
          plainto_tsquery('english', :q)
        )`,
        'relevance',
      );
    }

    // ── Intent-based filters ────────────────────────────────────────────
    if (intent.productType) {
      qb.andWhere('dp.type = :productType', {
        productType: intent.productType,
      });
    }

    if (intent.category) {
      qb.leftJoin('dp.category', 'cat');
      qb.andWhere('(cat.name ILIKE :catName OR cat.slug ILIKE :catSlug)', {
        catName: `%${intent.category}%`,
        catSlug: `%${intent.category.toLowerCase().replace(/\s+/g, '-')}%`,
      });
    }

    if (intent.priceRange?.min != null) {
      qb.andWhere('dp.price >= :minPrice', {
        minPrice: intent.priceRange.min,
      });
    }

    if (intent.priceRange?.max != null) {
      qb.andWhere('dp.price <= :maxPrice', {
        maxPrice: intent.priceRange.max,
      });
    }

    // ── Count ───────────────────────────────────────────────────────────
    const total = await qb.getCount();

    // ── Sorting ─────────────────────────────────────────────────────────
    switch (intent.sortPreference) {
      case 'price_asc':
        qb.orderBy('dp.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('dp.price', 'DESC');
        break;
      case 'rating':
        qb.orderBy('dp.averageRating', 'DESC').addOrderBy(
          'dp.totalReviews',
          'DESC',
        );
        break;
      case 'newest':
        qb.orderBy('dp.createdAt', 'DESC');
        break;
      case 'popular':
        qb.orderBy('dp.viewCount', 'DESC');
        break;
      default:
        if (searchQuery) {
          qb.orderBy('relevance', 'DESC');
        } else {
          qb.orderBy('dp.averageRating', 'DESC');
        }
        break;
    }

    qb.skip(offset).take(limit);

    // ── Execute ─────────────────────────────────────────────────────────
    const results = await qb.getRawAndEntities();

    const items: SmartSearchResult[] = results.entities.map((p, i) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      shortDescription: p.shortDescription,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice
        ? Number(p.compareAtPrice)
        : undefined,
      featuredImage: p.featuredImage,
      averageRating: Number(p.averageRating),
      totalReviews: p.totalReviews,
      type: p.type,
      relevanceScore: results.raw[i]?.relevance
        ? parseFloat(results.raw[i].relevance)
        : 0,
    }));

    // ── Related searches ────────────────────────────────────────────────
    const relatedSearches = await this.getRelatedSearches(searchQuery);

    const response: SmartSearchResponse = {
      items,
      intent,
      total,
      page,
      limit,
      hasNextPage: offset + limit < total,
      didYouMean:
        intent.correctedQuery && intent.correctedQuery !== query
          ? intent.correctedQuery
          : undefined,
      relatedSearches,
    };

    return {
      status: 'success',
      message: `Found ${total} results for "${query}"`,
      data: response,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Smart Autocomplete
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Return autocomplete suggestions for a partial query.
   *
   * Combines three sources:
   *   1. Product title matches (ranked by view count).
   *   2. Category name matches.
   *   3. Static type-based keyword suggestions.
   *
   * Results are cached in Redis for AUTOCOMPLETE_CACHE_TTL seconds.
   */
  async getAutocomplete(
    query: string,
    limit: number = 8,
  ): Promise<ApiResponse<AutocompleteItem[]>> {
    if (!query || query.trim().length < 2) {
      return { status: 'success', message: 'No suggestions', data: [] };
    }

    const trimmed = query.trim();
    const cacheKey = `${CACHE_PREFIX}:autocomplete:${trimmed.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return {
        status: 'success',
        message: 'Autocomplete suggestions',
        data: JSON.parse(cached),
      };
    }

    const items: AutocompleteItem[] = [];

    // 1. Product title matches ───────────────────────────────────────────
    const products = await this.productRepository
      .createQueryBuilder('dp')
      .select([
        'dp.id',
        'dp.title',
        'dp.slug',
        'dp.featuredImage',
        'dp.price',
      ])
      .where('dp.status = :status', {
        status: DigitalProductStatus.PUBLISHED,
      })
      .andWhere('dp.title ILIKE :prefix', { prefix: `%${trimmed}%` })
      .orderBy('dp.viewCount', 'DESC')
      .take(limit)
      .getMany();

    for (const p of products) {
      items.push({
        text: p.title,
        type: 'product',
        productId: p.id,
        slug: p.slug,
        featuredImage: p.featuredImage,
        price: Number(p.price),
      });
    }

    // 2. Category matches ────────────────────────────────────────────────
    const categories = await this.productRepository.manager
      .createQueryBuilder()
      .select('DISTINCT cat.name', 'name')
      .from('digital_product_categories', 'cat')
      .where('cat.name ILIKE :prefix', { prefix: `%${trimmed}%` })
      .andWhere('cat.deleted_at IS NULL')
      .limit(3)
      .getRawMany();

    for (const cat of categories) {
      items.push({
        text: cat.name,
        type: 'category',
      });
    }

    // 3. Type-based keyword suggestions ──────────────────────────────────
    const typeMap: Record<string, string> = {
      excel: 'Excel Templates',
      powerpoint: 'PowerPoint Presentations',
      ppt: 'PowerPoint Presentations',
      document: 'Documents',
      template: 'Web Templates',
      design: 'Design Systems',
      code: 'Code Templates',
      startup: 'Startup Kits',
    };

    const lowerQuery = trimmed.toLowerCase();
    for (const [key, label] of Object.entries(typeMap)) {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
        items.push({ text: label, type: 'suggestion' });
        break;
      }
    }

    const uniqueItems = items.slice(0, limit);
    await this.redis.set(
      cacheKey,
      JSON.stringify(uniqueItems),
      AUTOCOMPLETE_CACHE_TTL,
    );

    return {
      status: 'success',
      message: 'Autocomplete suggestions',
      data: uniqueItems,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Related Searches
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Generate a handful of related / alternative search terms for a given
   * query.  Uses simple heuristics (no AI call) to keep latency low.
   */
  private async getRelatedSearches(query: string): Promise<string[]> {
    if (!query) return [];

    const cacheKey = `${CACHE_PREFIX}:related:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const words = query.toLowerCase().split(/\s+/);
    const related: string[] = [];

    const typeKeywords = [
      'excel',
      'powerpoint',
      'document',
      'template',
      'design',
      'code',
      'startup',
    ];
    const hasTypeKeyword = words.some((w) =>
      typeKeywords.some((tk) => w.includes(tk)),
    );

    if (!hasTypeKeyword) {
      related.push(
        `${query} template`,
        `${query} excel`,
        `${query} powerpoint`,
      );
    } else {
      related.push(
        `best ${query}`,
        `${query} professional`,
        `${query} free`,
      );
    }

    const result = related.slice(0, 5);
    await this.redis.set(
      cacheKey,
      JSON.stringify(result),
      INTENT_CACHE_TTL,
    );
    return result;
  }
}
