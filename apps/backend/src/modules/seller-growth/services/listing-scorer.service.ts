import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { MarketBenchmark } from '../../../entities/market-benchmark.entity';
import { AiService } from '../../ai/ai.service';
import { ListingScore } from '../dto/seller-growth.dto';

@Injectable()
export class ListingScorerService {
  private readonly logger = new Logger(ListingScorerService.name);

  constructor(
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    @InjectRepository(MarketBenchmark)
    private readonly benchmarkRepo: Repository<MarketBenchmark>,
    private readonly aiService: AiService,
  ) {}

  async scoreProduct(productId: string): Promise<ListingScore> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'tags'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 1. Title Quality (15 points)
    const titleQuality = this.scoreTitleQuality(product);

    // 2. Description Completeness (25 points)
    const descriptionCompleteness = this.scoreDescriptionCompleteness(product);

    // 3. Image Quality (20 points)
    const imageQuality = this.scoreImageQuality(product);

    // 4. SEO Optimization (15 points)
    const seoOptimization = this.scoreSeoOptimization(product);

    // 5. Pricing Competitiveness (15 points)
    const pricingCompetitiveness = await this.scorePricingCompetitiveness(product);

    // 6. Tag Relevance (10 points)
    const tagRelevance = this.scoreTagRelevance(product);

    const overallScore =
      titleQuality +
      descriptionCompleteness +
      imageQuality +
      seoOptimization +
      pricingCompetitiveness +
      tagRelevance;

    // Generate AI improvement suggestions
    let suggestions: ListingScore['suggestions'] = [];
    try {
      suggestions = await this.generateSuggestions(product, {
        titleQuality,
        descriptionCompleteness,
        imageQuality,
        seoOptimization,
        pricingCompetitiveness,
        tagRelevance,
      });
    } catch {
      this.logger.warn(`AI suggestion generation failed for product ${productId}`);
      suggestions = this.generateFallbackSuggestions({
        titleQuality,
        descriptionCompleteness,
        imageQuality,
        seoOptimization,
        pricingCompetitiveness,
        tagRelevance,
      });
    }

    return {
      productId: product.id,
      overallScore: Math.round(overallScore),
      dimensions: {
        titleQuality,
        descriptionCompleteness,
        imageQuality,
        seoOptimization,
        pricingCompetitiveness,
        tagRelevance,
      },
      suggestions,
    };
  }

  private scoreTitleQuality(product: DigitalProduct): number {
    let score = 0;
    const title = product.title || '';
    const len = title.length;

    // Length 30-80 chars
    if (len >= 30 && len <= 80) score += 8;
    else if (len >= 20 && len <= 100) score += 5;
    else if (len > 0) score += 2;

    // Not all caps
    if (title !== title.toUpperCase()) score += 4;

    // Contains keywords (at least 2 words)
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length >= 3) score += 3;
    else if (words.length >= 2) score += 1;

    return Math.min(15, score);
  }

  private scoreDescriptionCompleteness(product: DigitalProduct): number {
    let score = 0;
    const desc = product.description || '';
    const plainText = desc.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;

    // Word count > 200
    if (wordCount >= 200) score += 12;
    else if (wordCount >= 100) score += 8;
    else if (wordCount >= 50) score += 4;

    // Has formatting/headings
    if (desc.includes('<h') || desc.includes('##')) score += 5;

    // Includes feature list (ul/ol or - lists)
    if (desc.includes('<li') || desc.includes('<ul') || desc.includes('- ')) score += 5;

    // Has paragraph structure
    if (desc.includes('<p') || desc.split('\n\n').length > 2) score += 3;

    return Math.min(25, score);
  }

  private scoreImageQuality(product: DigitalProduct): number {
    let score = 0;

    // Has featured image
    if (product.featuredImage) score += 8;

    // Gallery images count >= 3
    const galleryCount = product.galleryImages?.length ?? 0;
    if (galleryCount >= 3) score += 12;
    else if (galleryCount >= 1) score += 6;

    return Math.min(20, score);
  }

  private scoreSeoOptimization(product: DigitalProduct): number {
    let score = 0;

    // SEO title set
    if (product.seoTitle && product.seoTitle.length > 0) score += 5;

    // SEO description set
    if (product.seoDescription && product.seoDescription.length > 0) score += 5;

    // SEO keywords >= 3
    const keywordsCount = product.seoKeywords?.length ?? 0;
    if (keywordsCount >= 3) score += 5;
    else if (keywordsCount >= 1) score += 2;

    return Math.min(15, score);
  }

  private async scorePricingCompetitiveness(product: DigitalProduct): Promise<number> {
    const benchmark = await this.benchmarkRepo.findOne({
      where: {
        productType: product.type,
        categoryId: product.categoryId || undefined,
      },
    });

    if (!benchmark) return 8; // Default to middle score when no benchmark

    const price = Number(product.price);
    const avgPrice = Number(benchmark.averagePrice);
    const deviation = Math.abs(price - avgPrice) / avgPrice;

    if (deviation <= 0.15) return 15; // Within 15% of average
    if (deviation <= 0.3) return 10;  // Within 30%
    if (deviation <= 0.5) return 5;   // Within 50%
    return 2;
  }

  private scoreTagRelevance(product: DigitalProduct): number {
    let score = 0;
    const tagCount = product.tags?.length ?? 0;

    if (tagCount >= 5) score += 10;
    else if (tagCount >= 3) score += 7;
    else if (tagCount >= 1) score += 3;

    return Math.min(10, score);
  }

  private async generateSuggestions(
    product: DigitalProduct,
    scores: ListingScore['dimensions'],
  ): Promise<ListingScore['suggestions']> {
    const systemPrompt = `You are a marketplace listing optimization expert. Based on the product data and scoring dimensions, generate improvement suggestions. Return a JSON array of objects with:
- "dimension": string (which scoring dimension this relates to)
- "suggestion": string (specific actionable suggestion)
- "impact": "high" | "medium" | "low"

Focus on the lowest-scoring dimensions first. Return 3-5 suggestions. Return ONLY valid JSON array, no markdown.`;

    const userMessage = `Product: "${product.title}"
Type: ${product.type}
Current Scores (out of max):
- Title Quality: ${scores.titleQuality}/15
- Description Completeness: ${scores.descriptionCompleteness}/25
- Image Quality: ${scores.imageQuality}/20
- SEO Optimization: ${scores.seoOptimization}/15
- Pricing Competitiveness: ${scores.pricingCompetitiveness}/15
- Tag Relevance: ${scores.tagRelevance}/10

Title length: ${product.title?.length ?? 0} chars
Description word count: ${(product.description || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length}
Has featured image: ${!!product.featuredImage}
Gallery images: ${product.galleryImages?.length ?? 0}
SEO title set: ${!!product.seoTitle}
SEO description set: ${!!product.seoDescription}
SEO keywords count: ${product.seoKeywords?.length ?? 0}
Tags count: ${product.tags?.length ?? 0}`;

    return this.aiService.generateJSON<ListingScore['suggestions']>(systemPrompt, userMessage);
  }

  private generateFallbackSuggestions(
    scores: ListingScore['dimensions'],
  ): ListingScore['suggestions'] {
    const suggestions: ListingScore['suggestions'] = [];

    if (scores.descriptionCompleteness < 15) {
      suggestions.push({
        dimension: 'descriptionCompleteness',
        suggestion: 'Expand your product description to at least 200 words with headings and feature lists.',
        impact: 'high',
      });
    }

    if (scores.imageQuality < 12) {
      suggestions.push({
        dimension: 'imageQuality',
        suggestion: 'Add at least 3 gallery images showcasing different aspects of your product.',
        impact: 'high',
      });
    }

    if (scores.seoOptimization < 10) {
      suggestions.push({
        dimension: 'seoOptimization',
        suggestion: 'Fill in the SEO title, description, and at least 3 keywords for better discoverability.',
        impact: 'medium',
      });
    }

    if (scores.titleQuality < 10) {
      suggestions.push({
        dimension: 'titleQuality',
        suggestion: 'Use a descriptive title between 30-80 characters that includes relevant keywords.',
        impact: 'medium',
      });
    }

    if (scores.tagRelevance < 7) {
      suggestions.push({
        dimension: 'tagRelevance',
        suggestion: 'Add at least 3-5 relevant tags to help buyers find your product.',
        impact: 'low',
      });
    }

    return suggestions.slice(0, 5);
  }
}
