import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogService } from '../entities/catalog-service.entity';
import { CatalogServiceQueryDto } from '../dto/catalog-service-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class CatalogServiceRepository {
  constructor(
    @InjectRepository(CatalogService)
    private readonly repository: Repository<CatalogService>,
  ) {}

  async findAll(query: CatalogServiceQueryDto): Promise<PaginatedResponse<CatalogService>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      towerId,
      isActive,
      isFeatured,
      industryTag,
    } = query;

    const qb = this.repository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.tower', 'tower')
      .leftJoinAndSelect('service.deliverables', 'deliverables', 'deliverables.isActive = :active', { active: true });

    // Apply filters
    if (search) {
      qb.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (towerId) {
      qb.andWhere('service.towerId = :towerId', { towerId });
    }

    if (isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', { isActive });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('service.isFeatured = :isFeatured', { isFeatured });
    }

    if (industryTag) {
      qb.andWhere('service.industryTags @> :industryTag', { industryTag: JSON.stringify([industryTag]) });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`service.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`service.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`service.${sortBy}`, sortOrder);
    qb.addOrderBy('service.createdAt', 'DESC');
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

  async findById(id: string): Promise<CatalogService | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['tower', 'deliverables'],
    });
  }

  async findBySlug(slug: string): Promise<CatalogService | null> {
    return this.repository.findOne({
      where: { slug },
      relations: ['tower', 'deliverables'],
    });
  }

  async findByTowerId(towerId: string): Promise<CatalogService[]> {
    return this.repository.find({
      where: { towerId, isActive: true },
      relations: ['deliverables'],
      order: { displayOrder: 'ASC' },
    });
  }

  async create(data: Partial<CatalogService>): Promise<CatalogService> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<CatalogService>): Promise<CatalogService | null> {
    await this.repository.update(id, data as Parameters<typeof this.repository.update>[1]);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('service')
      .where('service.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('service.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  private encodeCursor(data: { value: unknown }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: unknown } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
