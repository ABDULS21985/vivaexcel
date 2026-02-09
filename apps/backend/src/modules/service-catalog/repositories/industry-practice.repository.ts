import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryPractice } from '../entities/industry-practice.entity';
import { IndustryPracticeQueryDto } from '../dto/industry-practice-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class IndustryPracticeRepository {
  constructor(
    @InjectRepository(IndustryPractice)
    private readonly repository: Repository<IndustryPractice>,
  ) {}

  async findAll(query: IndustryPracticeQueryDto): Promise<PaginatedResponse<IndustryPractice>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      isActive,
    } = query;

    const qb = this.repository.createQueryBuilder('practice');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(practice.name ILIKE :search OR practice.code ILIKE :search OR practice.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('practice.isActive = :isActive', { isActive });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`practice.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`practice.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`practice.${sortBy}`, sortOrder);
    qb.addOrderBy('practice.createdAt', 'DESC');
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

  async findById(id: string): Promise<IndustryPractice | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<IndustryPractice | null> {
    return this.repository.findOne({
      where: { slug },
    });
  }

  async findByCode(code: string): Promise<IndustryPractice | null> {
    return this.repository.findOne({
      where: { code },
    });
  }

  async findAllActive(): Promise<IndustryPractice[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async create(data: Partial<IndustryPractice>): Promise<IndustryPractice> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<IndustryPractice>): Promise<IndustryPractice | null> {
    await this.repository.update(id, data as Parameters<typeof this.repository.update>[1]);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('practice')
      .where('practice.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('practice.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('practice')
      .where('practice.code = :code', { code });

    if (excludeId) {
      qb.andWhere('practice.id != :excludeId', { excludeId });
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
