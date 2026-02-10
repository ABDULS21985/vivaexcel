import { Injectable, Logger, Inject } from '@nestjs/common';
import { PreviewsRepository } from '../previews.repository';
import { WatermarkService } from './watermark.service';
import { PdfPreviewGeneratorService } from './pdf-preview-generator.service';
import { WebTemplatePreviewGeneratorService } from './web-template-preview-generator.service';
import { CodeTemplatePreviewGeneratorService } from './code-template-preview-generator.service';
import { StorageStrategy, STORAGE_STRATEGY } from '../../media/strategies/storage.interface';
import { DigitalProductPreviewType } from '../../../entities/digital-product-preview.entity';
import { GeneratePreviewsDto } from '../dto/generate-previews.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class PreviewGenerationService {
  private readonly logger = new Logger(PreviewGenerationService.name);

  constructor(
    private readonly previewsRepository: PreviewsRepository,
    private readonly watermarkService: WatermarkService,
    private readonly pdfGenerator: PdfPreviewGeneratorService,
    private readonly webGenerator: WebTemplatePreviewGeneratorService,
    private readonly codeGenerator: CodeTemplatePreviewGeneratorService,
    @Inject(STORAGE_STRATEGY)
    private readonly storageStrategy: StorageStrategy,
  ) {}

  /**
   * Generate preview assets for a digital product based on its type.
   */
  async generatePreviews(
    productId: string,
    dto: GeneratePreviewsDto = {},
  ): Promise<{ generated: number; errors: string[] }> {
    const product = await this.previewsRepository.findProduct(productId);
    if (!product) {
      return { generated: 0, errors: ['Product not found'] };
    }

    // Delete existing previews if force regeneration
    if (dto.force) {
      await this.previewsRepository.deleteByProductId(productId);
    }

    const errors: string[] = [];
    let generated = 0;

    try {
      switch (product.type) {
        case 'powerpoint': {
          const count = await this.generatePowerPointPreviews(productId, dto);
          generated += count;
          break;
        }
        case 'document':
        case 'solution_template': {
          const count = await this.generateDocumentPreviews(productId, dto);
          generated += count;
          break;
        }
        case 'web_template':
        case 'design_system': {
          const count = await this.generateWebTemplatePreviews(productId, dto);
          generated += count;
          break;
        }
        case 'code_template':
        case 'startup_kit': {
          const count = await this.generateCodeTemplatePreviews(productId, dto);
          generated += count;
          break;
        }
        default: {
          this.logger.warn(`No preview generation strategy for product type: ${product.type}`);
          errors.push(`Unsupported product type: ${product.type}`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Preview generation failed for product ${productId}: ${message}`);
      errors.push(message);
    }

    return { generated, errors };
  }

  private async generatePowerPointPreviews(
    productId: string,
    dto: GeneratePreviewsDto,
  ): Promise<number> {
    // For PowerPoint, we rely on existing slide previews from the presentations module.
    // Look for existing slide preview images and create DigitalProductPreview records.
    const product = await this.previewsRepository.findProduct(productId);
    if (!product) return 0;

    // Check if there are already preview images from the gallery
    const existingPreviews = await this.previewsRepository.findByProductId(productId);
    const imageUrls = [
      ...(product.galleryImages ?? []),
      ...existingPreviews.filter(p => p.type === DigitalProductPreviewType.IMAGE).map(p => p.url),
    ];

    let created = 0;
    const maxSlides = dto.maxSlides ?? 20;

    for (let i = 0; i < Math.min(imageUrls.length, maxSlides); i++) {
      const url = imageUrls[i];
      try {
        await this.previewsRepository.create({
          productId,
          type: DigitalProductPreviewType.SLIDE_IMAGE,
          url,
          label: `Slide ${i + 1}`,
          sortOrder: i,
          isWatermarked: false,
          generationStatus: 'completed',
          generatedAt: new Date(),
        });
        created++;
      } catch (err) {
        this.logger.warn(`Failed to create slide preview ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return created;
  }

  private async generateDocumentPreviews(
    productId: string,
    dto: GeneratePreviewsDto,
  ): Promise<number> {
    // Document preview generation would download the PDF from storage and convert pages
    // This is a placeholder - actual PDF buffer would come from product files
    this.logger.log(`Document preview generation requested for product ${productId}`);

    // In production, you would:
    // 1. Find the PDF file from product.files
    // 2. Download the buffer from storage
    // 3. Use pdfGenerator.generatePagePreviews()
    // 4. Upload the resulting images
    // 5. Create DigitalProductPreview records

    return 0;
  }

  private async generateWebTemplatePreviews(
    productId: string,
    dto: GeneratePreviewsDto,
  ): Promise<number> {
    const product = await this.previewsRepository.findProduct(productId);
    if (!product) return 0;

    // Find demo URL from existing previews or metadata
    const existingPreviews = await this.previewsRepository.findByProductId(productId);
    const demoPreview = existingPreviews.find(
      (p) => p.type === DigitalProductPreviewType.LIVE_DEMO_URL,
    );

    const demoUrl = demoPreview?.url ?? (product.metadata as Record<string, string>)?.demoUrl;
    if (!demoUrl) {
      this.logger.warn(`No demo URL found for web template product ${productId}`);
      return 0;
    }

    const breakpointMap = {
      mobile: 'mobile' as const,
      tablet: 'tablet' as const,
      desktop: 'desktop' as const,
    };

    const breakpoints = dto.breakpoints?.map(
      (bp) => breakpointMap[bp] ?? bp,
    ) ?? ['mobile', 'tablet', 'desktop'];

    const screenshots = await this.webGenerator.generateScreenshots(demoUrl, {
      breakpoints: breakpoints as ('mobile' | 'tablet' | 'desktop')[],
      watermark: dto.watermark !== false,
    });

    let created = 0;
    for (const screenshot of screenshots) {
      try {
        const storageKey = `previews/${productId}/screenshot-${screenshot.breakpoint}-${nanoid(8)}.png`;
        const uploadResult = await this.storageStrategy.upload(
          screenshot.imageBuffer,
          storageKey,
          'image/png',
        );

        await this.previewsRepository.create({
          productId,
          type: DigitalProductPreviewType.LIVE_SCREENSHOT,
          url: uploadResult.url,
          storageKey,
          label: `${screenshot.breakpoint.charAt(0).toUpperCase() + screenshot.breakpoint.slice(1)} View`,
          width: screenshot.width,
          height: screenshot.height,
          sortOrder: created,
          isWatermarked: dto.watermark !== false,
          generationStatus: 'completed',
          generatedAt: new Date(),
        });
        created++;
      } catch (err) {
        this.logger.warn(
          `Failed to save ${screenshot.breakpoint} screenshot: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return created;
  }

  private async generateCodeTemplatePreviews(
    productId: string,
    dto: GeneratePreviewsDto,
  ): Promise<number> {
    // Code template preview generation would:
    // 1. Download the ZIP from product files
    // 2. Analyze with codeGenerator.analyzeCodeArchive()
    // 3. Store the file tree and code snippets as preview metadata
    this.logger.log(`Code template preview generation requested for product ${productId}`);

    return 0;
  }
}
