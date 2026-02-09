import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DigitalProductsRepository } from '../digital-products.repository';
import { CreateDigitalProductCategoryDto } from '../dto/create-digital-product-category.dto';
import { UpdateDigitalProductCategoryDto } from '../dto/update-digital-product-category.dto';
import { DigitalProductCategory } from '../../../entities/digital-product-category.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE = 600; // 10 minutes
const CACHE_TAG = 'digital-product-categories';

@Injectable()
export class DigitalProductCategoriesService {
  private readonly logger = new Logger(DigitalProductCategoriesService.name);

  constructor(
    private readonly repository: DigitalProductsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<ApiResponse<DigitalProductCategory[]>> {
    const cacheKey = this.cacheService.generateKey('digital-product-categories', 'list');

    const categories = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllCategories(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Digital product categories retrieved successfully',
      data: categories,
    };
  }

  async findById(id: string): Promise<ApiResponse<DigitalProductCategory>> {
    const cacheKey = this.cacheService.generateKey('digital-product-categories', 'id', id);

    const category = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findCategoryById(id),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `digital-product-category:${id}`] },
    );

    if (!category) {
      throw new NotFoundException(`Digital product category with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Digital product category retrieved successfully',
      data: category,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<DigitalProductCategory>> {
    const cacheKey = this.cacheService.generateKey('digital-product-categories', 'slug', slug);

    const category = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findCategoryBySlug(slug),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `digital-product-category:slug:${slug}`] },
    );

    if (!category) {
      throw new NotFoundException(`Digital product category with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Digital product category retrieved successfully',
      data: category,
    };
  }

  async create(createDto: CreateDigitalProductCategoryDto): Promise<ApiResponse<DigitalProductCategory>> {
    // Check if slug already exists
    const slugExists = await this.repository.categorySlugExists(createDto.slug);
    if (slugExists) {
      throw new ConflictException('Digital product category slug already exists');
    }

    const category = await this.repository.createCategory(createDto);

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.debug('Invalidated digital product categories cache after create');

    return {
      status: 'success',
      message: 'Digital product category created successfully',
      data: category,
    };
  }

  async update(id: string, updateDto: UpdateDigitalProductCategoryDto): Promise<ApiResponse<DigitalProductCategory>> {
    const existing = await this.repository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException(`Digital product category with ID "${id}" not found`);
    }

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugExists = await this.repository.categorySlugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Digital product category slug already exists');
      }
    }

    const category = await this.repository.updateCategory(id, updateDto);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product-category:${id}`,
      `digital-product-category:slug:${existing.slug}`,
    ]);
    this.logger.debug(`Invalidated digital product categories cache after update for category ${id}`);

    return {
      status: 'success',
      message: 'Digital product category updated successfully',
      data: category!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException(`Digital product category with ID "${id}" not found`);
    }

    await this.repository.softDeleteCategory(id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product-category:${id}`,
      `digital-product-category:slug:${existing.slug}`,
    ]);
    this.logger.debug(`Invalidated digital product categories cache after delete for category ${id}`);

    return {
      status: 'success',
      message: 'Digital product category deleted successfully',
      data: null,
    };
  }
}
