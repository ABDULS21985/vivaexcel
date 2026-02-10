import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalProduct, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { MarketBenchmark } from '../../../entities/market-benchmark.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { AiService } from '../../ai/ai.service';
import { PricingAnalysis } from '../dto/seller-growth.dto';

@Injectable()
export class PricingOptimizerService {
  private readonly logger = new Logger(PricingOptimizerService.name);

  constructor(
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    @InjectRepository(MarketBenchmark)
    private readonly benchmarkRepo: Repository<MarketBenchmark>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    private readonly aiService: AiService,
  ) {}

  async analyzePricing(sellerId: string, productId: string): Promise<PricingAnalysis> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'tags'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get benchmark for this product type/category
    const benchmark = await this.benchmarkRepo.findOne({
      where: {
        productType: product.type,
        categoryId: product.categoryId || undefined,
      },
    });

    // Get price distribution for same category/type
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select('p.price')
      .where('p.type = :type', { type: product.type })
      .andWhere('p.status = :status', { status: DigitalProductStatus.PUBLISHED })
      .andWhere('p.id != :id', { id: productId });

    if (product.categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId: product.categoryId });
    }

    const competitors = await qb.getMany();
    const competitorPrices = competitors.map((p) => Number(p.price));

    const systemPrompt = `You are a pricing analyst for a digital product marketplace. Analyze the product data and market benchmarks provided, then return a JSON object with:
- "suggestedPrice": number (optimal price point)
- "priceRange": { "min": number, "max": number } (recommended range)
- "reasoning": string (2-3 sentences explaining your recommendation)
- "competitivePosition": "underpriced" | "competitive" | "overpriced"
- "confidenceScore": number (0-100)

Return ONLY valid JSON, no markdown.`;

    const descWordCount = product.description
      ? product.description.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
      : 0;

    const userMessage = `Product: "${product.title}"
Type: ${product.type}
Current Price: $${product.price}
Description Word Count: ${descWordCount}
Featured Image: ${product.featuredImage ? 'Yes' : 'No'}
Gallery Images: ${product.galleryImages?.length ?? 0}
Tags: ${product.tags?.map((t) => t.name || t).join(', ') || 'None'}
Average Rating: ${product.averageRating}
Download Count: ${product.downloadCount}

Market Benchmark:
${benchmark ? `- Average Price: $${benchmark.averagePrice}
- Median Price: $${benchmark.medianPrice}
- Price Range: $${benchmark.priceRange.min} - $${benchmark.priceRange.max}
- Average Rating: ${benchmark.averageRating}
- Top Seller Avg Price: $${benchmark.topSellerMetrics.avgPrice}
- Sample Size: ${benchmark.sampleSize}` : 'No benchmark data available'}

Competitor Prices: ${competitorPrices.length > 0 ? competitorPrices.sort((a, b) => a - b).join(', ') : 'No competitor data'}`;

    try {
      const result = await this.aiService.generateJSON<Omit<PricingAnalysis, 'productId' | 'productTitle' | 'currentPrice'>>(
        systemPrompt,
        userMessage,
      );

      return {
        productId: product.id,
        productTitle: product.title,
        currentPrice: Number(product.price),
        suggestedPrice: result.suggestedPrice,
        priceRange: result.priceRange,
        reasoning: result.reasoning,
        competitivePosition: result.competitivePosition,
        confidenceScore: result.confidenceScore,
      };
    } catch {
      this.logger.warn(`AI pricing analysis failed for product ${productId}, using fallback`);
      const avgPrice = benchmark ? Number(benchmark.averagePrice) : Number(product.price);
      return {
        productId: product.id,
        productTitle: product.title,
        currentPrice: Number(product.price),
        suggestedPrice: avgPrice,
        priceRange: benchmark
          ? benchmark.priceRange
          : { min: Number(product.price) * 0.8, max: Number(product.price) * 1.2 },
        reasoning: 'Based on market average pricing for this product category.',
        competitivePosition: 'competitive',
        confidenceScore: 30,
      };
    }
  }

  async bulkAnalyzePricing(sellerId: string): Promise<PricingAnalysis[]> {
    const seller = await this.sellerProfileRepo.findOne({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');

    const products = await this.productRepo.find({
      where: {
        createdBy: seller.userId,
        status: DigitalProductStatus.PUBLISHED,
      },
      take: 20,
    });

    const results: PricingAnalysis[] = [];
    for (const product of products) {
      try {
        const analysis = await this.analyzePricing(sellerId, product.id);
        results.push(analysis);
      } catch (error) {
        this.logger.warn(`Pricing analysis failed for product ${product.id}: ${(error as Error).message}`);
      }
    }

    return results;
  }
}
