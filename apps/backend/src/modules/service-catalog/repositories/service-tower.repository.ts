import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceTower } from '../entities/service-tower.entity';
import { ServiceTowerQueryDto } from '../dto/service-tower-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class ServiceTowerRepository {
  constructor(
    @InjectRepository(ServiceTower)
    private readonly repository: Repository<ServiceTower>,
  ) {}

  async findAll(query: ServiceTowerQueryDto): Promise<PaginatedResponse<ServiceTower>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      search,
      isActive,
      isFeatured,
    } = query;

    const qb = this.repository
      .createQueryBuilder('tower')
      .leftJoinAndSelect('tower.services', 'services', 'services.isActive = :active', { active: true });

    // Apply filters
    if (search) {
      qb.andWhere(
        '(tower.name ILIKE :search OR tower.shortName ILIKE :search OR tower.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('tower.isActive = :isActive', { isActive });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('tower.isFeatured = :isFeatured', { isFeatured });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`tower.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`tower.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`tower.${sortBy}`, sortOrder);
    qb.addOrderBy('tower.createdAt', 'DESC');
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

  async findById(id: string): Promise<ServiceTower | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['services'],
    });
  }

  async findBySlug(slug: string): Promise<ServiceTower | null> {
    return this.repository.findOne({
      where: { slug },
      relations: ['services'],
    });
  }

  async findByCode(code: string): Promise<ServiceTower | null> {
    return this.repository.findOne({
      where: { code },
      relations: ['services'],
    });
  }

  async create(data: Partial<ServiceTower>): Promise<ServiceTower> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<ServiceTower>): Promise<ServiceTower | null> {
    await this.repository.update(id, data as Parameters<typeof this.repository.update>[1]);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('tower')
      .where('tower.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('tower.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const qb = this.repository.createQueryBuilder('tower')
      .where('tower.code = :code', { code });

    if (excludeId) {
      qb.andWhere('tower.id != :excludeId', { excludeId });
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
