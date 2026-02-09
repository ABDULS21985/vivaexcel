import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presentation } from '../../entities/presentation.entity';
import { SlidePreview } from '../../entities/slide-preview.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { PresentationQueryDto } from './dto/presentation-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class PresentationsRepository {
  constructor(
    @InjectRepository(Presentation)
    private readonly presentationRepository: Repository<Presentation>,
    @InjectRepository(SlidePreview)
    private readonly slidePreviewRepository: Repository<SlidePreview>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Presentation methods
  // ──────────────────────────────────────────────

  async findAll(query: PresentationQueryDto): Promise<PaginatedResponse<Presentation>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      industry,
      presentationType,
      fileFormat,
      aspectRatio,
      hasAnimations,
      hasSpeakerNotes,
      minSlideCount,
      maxSlideCount,
      softwareCompatibility,
      minPrice,
      maxPrice,
      isFeatured,
    } = query;

    const qb = this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoinAndSelect('presentation.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .leftJoinAndSelect('digitalProduct.category', 'category')
      .leftJoinAndSelect('presentation.slidePreviews', 'slidePreviews');

    // Search across digital product title and description
    if (search) {
      qb.andWhere(
        '(digitalProduct.title ILIKE :search OR digitalProduct.description ILIKE :search OR digitalProduct.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Presentation-specific filters
    if (industry) {
      qb.andWhere('presentation.industry = :industry', { industry });
    }

    if (presentationType) {
      qb.andWhere('presentation.presentationType = :presentationType', { presentationType });
    }

    if (fileFormat) {
      qb.andWhere('presentation.fileFormat = :fileFormat', { fileFormat });
    }

    if (aspectRatio) {
      qb.andWhere('presentation.aspectRatio = :aspectRatio', { aspectRatio });
    }

    if (hasAnimations !== undefined) {
      qb.andWhere('presentation.hasAnimations = :hasAnimations', { hasAnimations });
    }

    if (hasSpeakerNotes !== undefined) {
      qb.andWhere('presentation.hasSpeakerNotes = :hasSpeakerNotes', { hasSpeakerNotes });
    }

    // Slide count range
    if (minSlideCount !== undefined && maxSlideCount !== undefined) {
      qb.andWhere('presentation.slideCount BETWEEN :minSlideCount AND :maxSlideCount', {
        minSlideCount,
        maxSlideCount,
      });
    } else if (minSlideCount !== undefined) {
      qb.andWhere('presentation.slideCount >= :minSlideCount', { minSlideCount });
    } else if (maxSlideCount !== undefined) {
      qb.andWhere('presentation.slideCount <= :maxSlideCount', { maxSlideCount });
    }

    // Software compatibility (JSONB contains)
    if (softwareCompatibility) {
      qb.andWhere('presentation.softwareCompatibility @> :compatibility', {
        compatibility: JSON.stringify([softwareCompatibility]),
      });
    }

    // Digital product price filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      qb.andWhere('digitalProduct.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      qb.andWhere('digitalProduct.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      qb.andWhere('digitalProduct.price <= :maxPrice', { maxPrice });
    }

    // Featured filter (from digital product)
    if (isFeatured !== undefined) {
      qb.andWhere('digitalProduct.isFeatured = :isFeatured', { isFeatured });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`presentation.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`presentation.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`presentation.${sortBy}`, sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: (items[items.length - 1] as unknown as Record<string, unknown>)[sortBy] })
      : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findById(id: string): Promise<Presentation | null> {
    return this.presentationRepository.findOne({
      where: { id },
      relations: [
        'digitalProduct',
        'digitalProduct.creator',
        'digitalProduct.category',
        'digitalProduct.tags',
        'slidePreviews',
      ],
    });
  }

  async findByProductId(digitalProductId: string): Promise<Presentation | null> {
    return this.presentationRepository.findOne({
      where: { digitalProductId },
      relations: [
        'digitalProduct',
        'digitalProduct.creator',
        'digitalProduct.category',
        'slidePreviews',
      ],
    });
  }

  async create(data: Partial<Presentation>): Promise<Presentation> {
    const presentation = this.presentationRepository.create(data);
    return this.presentationRepository.save(presentation);
  }

  async update(id: string, data: Partial<Presentation>): Promise<Presentation | null> {
    const presentation = await this.findById(id);
    if (!presentation) return null;

    Object.assign(presentation, data);
    return this.presentationRepository.save(presentation);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.presentationRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  Slide preview methods
  // ──────────────────────────────────────────────

  async findSlidePreviews(presentationId: string): Promise<SlidePreview[]> {
    return this.slidePreviewRepository.find({
      where: { presentationId },
      order: { sortOrder: 'ASC', slideNumber: 'ASC' },
    });
  }

  async findSlidePreviewById(id: string): Promise<SlidePreview | null> {
    return this.slidePreviewRepository.findOne({ where: { id } });
  }

  async createSlidePreview(data: Partial<SlidePreview>): Promise<SlidePreview> {
    const slidePreview = this.slidePreviewRepository.create(data);
    return this.slidePreviewRepository.save(slidePreview);
  }

  async updateSlidePreview(id: string, data: Partial<SlidePreview>): Promise<SlidePreview | null> {
    const slidePreview = await this.slidePreviewRepository.findOne({ where: { id } });
    if (!slidePreview) return null;

    Object.assign(slidePreview, data);
    return this.slidePreviewRepository.save(slidePreview);
  }

  async deleteSlidePreview(id: string): Promise<boolean> {
    const result = await this.slidePreviewRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  async bulkCreateSlidePreviews(previews: Partial<SlidePreview>[]): Promise<SlidePreview[]> {
    const entities = this.slidePreviewRepository.create(previews);
    return this.slidePreviewRepository.save(entities);
  }

  // ──────────────────────────────────────────────
  //  Featured & discovery methods
  // ──────────────────────────────────────────────

  async findFeatured(limit: number = 10): Promise<Presentation[]> {
    return this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoinAndSelect('presentation.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .leftJoinAndSelect('presentation.slidePreviews', 'slidePreviews')
      .where('digitalProduct.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('digitalProduct.status = :status', { status: 'published' })
      .orderBy('digitalProduct.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByIndustry(industry: string, limit: number = 10): Promise<Presentation[]> {
    return this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoinAndSelect('presentation.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .leftJoinAndSelect('presentation.slidePreviews', 'slidePreviews')
      .where('presentation.industry = :industry', { industry })
      .andWhere('digitalProduct.status = :status', { status: 'published' })
      .orderBy('digitalProduct.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByType(presentationType: string, limit: number = 10): Promise<Presentation[]> {
    return this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoinAndSelect('presentation.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .leftJoinAndSelect('presentation.slidePreviews', 'slidePreviews')
      .where('presentation.presentationType = :presentationType', { presentationType })
      .andWhere('digitalProduct.status = :status', { status: 'published' })
      .orderBy('digitalProduct.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  // ──────────────────────────────────────────────
  //  Stats methods
  // ──────────────────────────────────────────────

  async countByIndustry(): Promise<{ industry: string; count: number }[]> {
    const results = await this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoin('presentation.digitalProduct', 'digitalProduct')
      .select('presentation.industry', 'industry')
      .addSelect('COUNT(presentation.id)', 'count')
      .where('digitalProduct.status = :status', { status: 'published' })
      .groupBy('presentation.industry')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      industry: row.industry,
      count: parseInt(row.count, 10),
    }));
  }

  async countByType(): Promise<{ presentationType: string; count: number }[]> {
    const results = await this.presentationRepository
      .createQueryBuilder('presentation')
      .leftJoin('presentation.digitalProduct', 'digitalProduct')
      .select('presentation.presentation_type', 'presentationType')
      .addSelect('COUNT(presentation.id)', 'count')
      .where('digitalProduct.status = :status', { status: 'published' })
      .groupBy('presentation.presentation_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      presentationType: row.presentationType,
      count: parseInt(row.count, 10),
    }));
  }

  // ──────────────────────────────────────────────
  //  Cursor helpers
  // ──────────────────────────────────────────────

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
