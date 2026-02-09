import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { ServiceQueryDto } from './dto/service-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
  ) {}

  async findAllServices(query: ServiceQueryDto): Promise<PaginatedResponse<Service>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'order',
      sortOrder = 'ASC',
      search,
      status,
      categoryId,
      categorySlug,
      isFeatured,
    } = query;

    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('service.status = :status', { status });
    }

    if (categoryId) {
      qb.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('service.isFeatured = :isFeatured', { isFeatured });
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

  async findServiceById(id: string): Promise<Service | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findServiceBySlug(slug: string): Promise<Service | null> {
    return this.serviceRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
  }

  async createService(data: Partial<Service>): Promise<Service> {
    const service = this.serviceRepository.create(data);
    return this.serviceRepository.save(service);
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service | null> {
    await this.serviceRepository.update(id, data);
    return this.findServiceById(id);
  }

  async softDeleteService(id: string): Promise<boolean> {
    const result = await this.serviceRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  // Category methods
  async findAllCategories(): Promise<ServiceCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<ServiceCategory | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async createCategory(data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory | null> {
    await this.categoryRepository.update(id, data);
    return this.findCategoryById(id);
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.serviceRepository.createQueryBuilder('service')
      .where('service.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('service.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.categoryRepository.createQueryBuilder('category')
      .where('category.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

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
