import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PresentationsRepository } from '../presentations.repository';
import { AiService } from '../../ai/ai.service';
import { CreatePresentationDto } from '../dto/create-presentation.dto';
import { UpdatePresentationDto } from '../dto/update-presentation.dto';
import { CreateSlidePreviewDto } from '../dto/create-slide-preview.dto';
import { UpdateSlidePreviewDto } from '../dto/update-slide-preview.dto';
import { PresentationQueryDto } from '../dto/presentation-query.dto';
import { Presentation } from '../../../entities/presentation.entity';
import { SlidePreview } from '../../../entities/slide-preview.entity';
import { PaginatedResponse, ApiResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE = 600; // 10 minutes
const CACHE_TAG = 'presentations';

@Injectable()
export class PresentationsService {
  private readonly logger = new Logger(PresentationsService.name);

  constructor(
    private readonly repository: PresentationsRepository,
    private readonly cacheService: CacheService,
    private readonly aiService: AiService,
  ) {}

  // ──────────────────────────────────────────────
  //  Presentation CRUD
  // ──────────────────────────────────────────────

  async findAll(query: PresentationQueryDto): Promise<ApiResponse<PaginatedResponse<Presentation>>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAll(query),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Presentations retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<Presentation>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'id', id);

    const presentation = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findById(id),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `presentation:${id}`] },
    );

    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Presentation retrieved successfully',
      data: presentation,
    };
  }

  async findByProductId(digitalProductId: string): Promise<ApiResponse<Presentation>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'product', digitalProductId);

    const presentation = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findByProductId(digitalProductId),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `presentation:product:${digitalProductId}`] },
    );

    if (!presentation) {
      throw new NotFoundException(`Presentation for digital product "${digitalProductId}" not found`);
    }

    return {
      status: 'success',
      message: 'Presentation retrieved successfully',
      data: presentation,
    };
  }

  async create(userId: string, dto: CreatePresentationDto): Promise<ApiResponse<Presentation>> {
    const presentation = await this.repository.create(dto as Partial<Presentation>);

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.debug('Invalidated presentations cache after create');

    return {
      status: 'success',
      message: 'Presentation created successfully',
      data: presentation,
    };
  }

  async update(id: string, dto: UpdatePresentationDto): Promise<ApiResponse<Presentation>> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Presentation with ID "${id}" not found`);
    }

    const updatedPresentation = await this.repository.update(id, dto as Partial<Presentation>);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${id}`,
      `presentation:product:${existing.digitalProductId}`,
    ]);
    this.logger.debug(`Invalidated presentations cache after update for presentation ${id}`);

    return {
      status: 'success',
      message: 'Presentation updated successfully',
      data: updatedPresentation!,
    };
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const presentation = await this.repository.findById(id);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${id}" not found`);
    }

    await this.repository.softDelete(id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${id}`,
      `presentation:product:${presentation.digitalProductId}`,
    ]);
    this.logger.debug(`Invalidated presentations cache after delete for presentation ${id}`);

    return {
      status: 'success',
      message: 'Presentation deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Slide preview operations
  // ──────────────────────────────────────────────

  async getSlidePreviews(presentationId: string): Promise<ApiResponse<SlidePreview[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'slides', presentationId);

    const slidePreviews = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findSlidePreviews(presentationId),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `presentation:${presentationId}:slides`] },
    );

    return {
      status: 'success',
      message: 'Slide previews retrieved successfully',
      data: slidePreviews,
    };
  }

  async addSlidePreview(presentationId: string, dto: CreateSlidePreviewDto): Promise<ApiResponse<SlidePreview>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    const slidePreview = await this.repository.createSlidePreview({
      ...dto,
      presentationId,
    });

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${presentationId}`,
      `presentation:${presentationId}:slides`,
    ]);
    this.logger.debug(`Created slide preview for presentation ${presentationId}`);

    return {
      status: 'success',
      message: 'Slide preview created successfully',
      data: slidePreview,
    };
  }

  async updateSlidePreview(slideId: string, dto: UpdateSlidePreviewDto): Promise<ApiResponse<SlidePreview>> {
    const existing = await this.repository.findSlidePreviewById(slideId);
    if (!existing) {
      throw new NotFoundException(`Slide preview with ID "${slideId}" not found`);
    }

    const slidePreview = await this.repository.updateSlidePreview(slideId, dto);
    if (!slidePreview) {
      throw new NotFoundException(`Slide preview with ID "${slideId}" not found`);
    }

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${existing.presentationId}`,
      `presentation:${existing.presentationId}:slides`,
    ]);
    this.logger.debug(`Updated slide preview ${slideId}`);

    return {
      status: 'success',
      message: 'Slide preview updated successfully',
      data: slidePreview,
    };
  }

  async deleteSlidePreview(slideId: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findSlidePreviewById(slideId);
    if (!existing) {
      throw new NotFoundException(`Slide preview with ID "${slideId}" not found`);
    }

    const deleted = await this.repository.deleteSlidePreview(slideId);
    if (!deleted) {
      throw new NotFoundException(`Slide preview with ID "${slideId}" not found`);
    }

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${existing.presentationId}`,
      `presentation:${existing.presentationId}:slides`,
    ]);
    this.logger.debug(`Deleted slide preview ${slideId}`);

    return {
      status: 'success',
      message: 'Slide preview deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  AI operations
  // ──────────────────────────────────────────────

  async generateAiDescription(presentationId: string): Promise<ApiResponse<Presentation>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    const features: string[] = [];
    if (presentation.hasAnimations) features.push('animations');
    if (presentation.hasTransitions) features.push('transitions');
    if (presentation.hasSpeakerNotes) features.push('speaker notes');
    if (presentation.hasCharts) features.push('charts');
    if (presentation.hasImages) features.push('images');

    const prompt = `Generate a compelling, detailed product description for a presentation template with the following characteristics:
- Type: ${presentation.presentationType}
- Industry: ${presentation.industry}
- Slide count: ${presentation.slideCount}
- Aspect ratio: ${presentation.aspectRatio}
- File format: ${presentation.fileFormat}
- Features: ${features.length > 0 ? features.join(', ') : 'none specified'}
- Software compatibility: ${presentation.softwareCompatibility?.join(', ') || 'not specified'}
- Font families: ${presentation.fontFamilies?.join(', ') || 'not specified'}
${presentation.digitalProduct?.title ? `- Product title: ${presentation.digitalProduct.title}` : ''}
${presentation.digitalProduct?.shortDescription ? `- Short description: ${presentation.digitalProduct.shortDescription}` : ''}

Write a professional, engaging description (200-400 words) that highlights the value proposition, key features, and ideal use cases. The description should be SEO-friendly and appeal to professionals looking for presentation templates. Return only the description text, nothing else.`;

    const description = await this.aiService.improveParagraph(prompt);

    const updated = await this.repository.update(presentationId, {
      aiGeneratedDescription: description,
      lastAnalyzedAt: new Date(),
    });

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${presentationId}`,
    ]);
    this.logger.debug(`Generated AI description for presentation ${presentationId}`);

    return {
      status: 'success',
      message: 'AI description generated successfully',
      data: updated!,
    };
  }

  async generateAiSeoMetadata(presentationId: string): Promise<ApiResponse<{
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
  }>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    const productTitle = presentation.digitalProduct?.title || 'Presentation Template';
    const productDescription = presentation.digitalProduct?.description || '';

    const seoTitle = await this.aiService.generateTitleSuggestions(
      `${productTitle}. ${presentation.presentationType} template for ${presentation.industry} with ${presentation.slideCount} slides.`,
    );

    const seoDescription = await this.aiService.generateMetaDescription(
      productTitle,
      `${productDescription} ${presentation.presentationType} presentation template for the ${presentation.industry} industry. Contains ${presentation.slideCount} professionally designed slides in ${presentation.fileFormat} format. Compatible with ${presentation.softwareCompatibility?.join(', ') || 'major presentation software'}.`,
    );

    const contentForTopics = `${productTitle} ${productDescription} ${presentation.presentationType} ${presentation.industry} presentation template slides ${presentation.fileFormat}`;
    const analysis = await this.aiService.analyzeContent(contentForTopics);

    const result = {
      seoTitle: seoTitle[0] || productTitle,
      seoDescription,
      seoKeywords: analysis.keyTopics || [],
    };

    // Update the digital product SEO fields if the digital product exists
    this.logger.debug(`Generated AI SEO metadata for presentation ${presentationId}`);

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${presentationId}`,
    ]);

    return {
      status: 'success',
      message: 'AI SEO metadata generated successfully',
      data: result,
    };
  }

  async suggestAiPricing(presentationId: string): Promise<ApiResponse<Presentation>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    const features: string[] = [];
    if (presentation.hasAnimations) features.push('custom animations');
    if (presentation.hasTransitions) features.push('slide transitions');
    if (presentation.hasSpeakerNotes) features.push('speaker notes');
    if (presentation.hasCharts) features.push('data charts');
    if (presentation.hasImages) features.push('professional images');
    if (presentation.isFullyEditable) features.push('fully editable');
    if (presentation.includesDocumentation) features.push('includes documentation');

    const prompt = `You are a digital product pricing expert. Suggest a fair market price in USD for a presentation template with these characteristics:
- Type: ${presentation.presentationType}
- Industry: ${presentation.industry}
- Slide count: ${presentation.slideCount}
- Aspect ratio: ${presentation.aspectRatio}
- File format: ${presentation.fileFormat}
- Features: ${features.length > 0 ? features.join(', ') : 'basic'}
- Software compatibility: ${presentation.softwareCompatibility?.join(', ') || 'not specified'}
- Master slides: ${presentation.masterSlideCount || 'unknown'}
- Layouts: ${presentation.layoutCount || 'unknown'}
${presentation.colorSchemes?.length ? `- Color schemes: ${presentation.colorSchemes.length}` : ''}

Consider that:
- Basic templates (10-20 slides, minimal features) typically sell for $5-15
- Mid-range templates (20-50 slides, some features) typically sell for $15-35
- Premium templates (50+ slides, many features, multiple color schemes) typically sell for $35-79
- Enterprise/niche industry templates can command higher prices

Return ONLY a single number representing the suggested price in USD (e.g., "29.99"). No other text.`;

    const priceText = await this.aiService.improveParagraph(prompt);

    // Parse the price from AI response
    const priceMatch = priceText.match(/(\d+(?:\.\d{1,2})?)/);
    const suggestedPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

    if (suggestedPrice !== null && suggestedPrice > 0) {
      const updated = await this.repository.update(presentationId, {
        aiSuggestedPrice: suggestedPrice,
        lastAnalyzedAt: new Date(),
      });

      await this.cacheService.invalidateByTags([
        CACHE_TAG,
        `presentation:${presentationId}`,
      ]);
      this.logger.debug(`AI suggested price $${suggestedPrice} for presentation ${presentationId}`);

      return {
        status: 'success',
        message: `AI suggested price: $${suggestedPrice}`,
        data: updated!,
      };
    }

    // Fallback: return the presentation unchanged if parsing failed
    this.logger.warn(`Failed to parse AI pricing response for presentation ${presentationId}: "${priceText}"`);

    return {
      status: 'success',
      message: 'AI pricing suggestion could not be determined. Please set price manually.',
      data: presentation,
    };
  }

  async analyzePresentation(presentationId: string): Promise<ApiResponse<{
    presentation: Presentation;
    seo: { seoTitle: string; seoDescription: string; seoKeywords: string[] };
    suggestedTags: string[];
  }>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    // Run all AI analyses in parallel
    const [descriptionResult, seoResult, pricingResult, tagsResult] = await Promise.all([
      this.generateAiDescription(presentationId),
      this.generateAiSeoMetadata(presentationId),
      this.suggestAiPricing(presentationId),
      this.generateSuggestedTags(presentation),
    ]);

    // Store suggested tags
    const updatedPresentation = await this.repository.update(presentationId, {
      aiSuggestedTags: tagsResult,
      lastAnalyzedAt: new Date(),
    });

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `presentation:${presentationId}`,
    ]);
    this.logger.debug(`Full AI analysis completed for presentation ${presentationId}`);

    return {
      status: 'success',
      message: 'Full AI analysis completed successfully',
      data: {
        presentation: updatedPresentation ?? pricingResult.data ?? presentation,
        seo: seoResult.data ?? { seoTitle: '', seoDescription: '', seoKeywords: [] },
        suggestedTags: tagsResult,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Featured & discovery
  // ──────────────────────────────────────────────

  async getFeaturedPresentations(limit: number = 10): Promise<ApiResponse<Presentation[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'featured', limit);

    const presentations = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findFeatured(limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Featured presentations retrieved successfully',
      data: presentations,
    };
  }

  async getByIndustry(industry: string, limit: number = 10): Promise<ApiResponse<Presentation[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'industry', industry, limit);

    const presentations = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findByIndustry(industry, limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: `Presentations for industry "${industry}" retrieved successfully`,
      data: presentations,
    };
  }

  async getByType(type: string, limit: number = 10): Promise<ApiResponse<Presentation[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'type', type, limit);

    const presentations = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findByType(type, limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: `Presentations of type "${type}" retrieved successfully`,
      data: presentations,
    };
  }

  async getIndustryStats(): Promise<ApiResponse<{ industry: string; count: number }[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'stats', 'industry');

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.countByIndustry(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Industry statistics retrieved successfully',
      data: stats,
    };
  }

  async getTypeStats(): Promise<ApiResponse<{ presentationType: string; count: number }[]>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'stats', 'type');

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.countByType(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Type statistics retrieved successfully',
      data: stats,
    };
  }

  async getLandingPageData(): Promise<ApiResponse<{
    featured: Presentation[];
    industryStats: { industry: string; count: number }[];
    typeStats: { presentationType: string; count: number }[];
  }>> {
    const cacheKey = this.cacheService.generateKey('presentations', 'landing');

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const [featured, industryStats, typeStats] = await Promise.all([
          this.repository.findFeatured(8),
          this.repository.countByIndustry(),
          this.repository.countByType(),
        ]);

        return {
          featured,
          industryStats,
          typeStats,
        };
      },
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Landing page data retrieved successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async generateSuggestedTags(presentation: Presentation): Promise<string[]> {
    const features: string[] = [];
    if (presentation.hasAnimations) features.push('animated');
    if (presentation.hasTransitions) features.push('transitions');
    if (presentation.hasSpeakerNotes) features.push('speaker-notes');
    if (presentation.hasCharts) features.push('charts');
    if (presentation.hasImages) features.push('images');

    const content = `${presentation.digitalProduct?.title || ''} ${presentation.digitalProduct?.description || ''} ${presentation.presentationType} ${presentation.industry} presentation template with ${presentation.slideCount} slides. Features: ${features.join(', ')}. Format: ${presentation.fileFormat}. Compatible with ${presentation.softwareCompatibility?.join(', ') || 'major software'}.`;

    const topics = await this.aiService.suggestRelatedTopics(content);

    // Convert topic suggestions to tag-like strings
    const tags = topics.map((topic) =>
      topic
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50),
    ).filter((tag) => tag.length > 0);

    // Add standard tags based on metadata
    const standardTags = [
      presentation.industry,
      presentation.presentationType.replace(/_/g, '-'),
      presentation.fileFormat,
      `${presentation.slideCount}-slides`,
    ];

    // Combine and deduplicate
    const allTags = [...new Set([...standardTags, ...tags])];

    return allTags.slice(0, 15);
  }
}
