import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQuery } from '../../search/entities/search-query.entity';
import { DigitalProduct, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { AiService } from '../../ai/ai.service';
import { CacheService } from '../../../common/cache/cache.service';
import { MarketOpportunity } from '../dto/seller-growth.dto';

@Injectable()
export class MarketOpportunityService {
  private readonly logger = new Logger(MarketOpportunityService.name);

  constructor(
    @InjectRepository(SearchQuery)
    private readonly searchQueryRepo: Repository<SearchQuery>,
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    private readonly aiService: AiService,
    private readonly cacheService: CacheService,
  ) {}

  async findOpportunities(sellerId: string): Promise<MarketOpportunity[]> {
    const seller = await this.sellerProfileRepo.findOne({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');

    // Check cache
    const cacheKey = `seller-opportunities:${sellerId}`;
    const cached = await this.cacheService.get<MarketOpportunity[]>(cacheKey);
    if (cached) return cached;

    // 1. Query search terms with low/no results in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const rawGaps = await this.searchQueryRepo
      .createQueryBuilder('sq')
      .select('LOWER(TRIM(sq.query))', 'term')
      .addSelect('COUNT(*)', 'searchVolume')
      .addSelect('AVG(sq.result_count)', 'avgResults')
      .where('sq.created_at >= :since', { since: ninetyDaysAgo })
      .andWhere('sq.result_count < :maxResults', { maxResults: 3 })
      .groupBy('LOWER(TRIM(sq.query))')
      .having('COUNT(*) >= :minCount', { minCount: 2 })
      .orderBy('"searchVolume"', 'DESC')
      .limit(100)
      .getRawMany<{ term: string; searchVolume: string; avgResults: string }>();

    if (rawGaps.length === 0) {
      await this.cacheService.set(cacheKey, [], 86400);
      return [];
    }

    // 2. Cross-reference against existing products
    const gaps: Array<{ term: string; searchVolume: number; existingProducts: number }> = [];

    for (const gap of rawGaps.slice(0, 50)) {
      const existingCount = await this.productRepo
        .createQueryBuilder('p')
        .where('p.status = :status', { status: DigitalProductStatus.PUBLISHED })
        .andWhere(
          '(LOWER(p.title) LIKE :term OR LOWER(p.description) LIKE :term)',
          { term: `%${gap.term}%` },
        )
        .getCount();

      if (existingCount < 3) {
        gaps.push({
          term: gap.term,
          searchVolume: parseInt(gap.searchVolume, 10),
          existingProducts: existingCount,
        });
      }
    }

    if (gaps.length === 0) {
      await this.cacheService.set(cacheKey, [], 86400);
      return [];
    }

    // 3. Use AI to categorize and score opportunities
    let opportunities: MarketOpportunity[];
    try {
      const systemPrompt = `You are a marketplace analyst. Analyze search gap data and categorize each opportunity. Return a JSON array of objects with:
- "term": string (the search term)
- "searchVolume": number (from input)
- "existingProducts": number (from input)
- "potential": "HIGH" | "MEDIUM" | "LOW"
- "suggestedProductType": string (e.g., "powerpoint", "document", "web_template")
- "reasoning": string (1 sentence explaining why this is an opportunity)

Consider search volume, competition level, and likely demand. Return ONLY valid JSON array, no markdown.`;

      const userMessage = `Search gap data (term | search volume | existing products):
${gaps.slice(0, 30).map((g) => `"${g.term}" | ${g.searchVolume} | ${g.existingProducts}`).join('\n')}`;

      opportunities = await this.aiService.generateJSON<MarketOpportunity[]>(systemPrompt, userMessage);
    } catch {
      this.logger.warn('AI opportunity analysis failed, using basic scoring');
      opportunities = gaps.slice(0, 20).map((g) => ({
        term: g.term,
        searchVolume: g.searchVolume,
        existingProducts: g.existingProducts,
        potential: g.searchVolume >= 10 ? 'HIGH' as const : g.searchVolume >= 5 ? 'MEDIUM' as const : 'LOW' as const,
        suggestedProductType: 'document',
        reasoning: `${g.searchVolume} searches with only ${g.existingProducts} existing products.`,
      }));
    }

    // Cache for 24 hours
    await this.cacheService.set(cacheKey, opportunities, 86400);

    return opportunities;
  }
}
