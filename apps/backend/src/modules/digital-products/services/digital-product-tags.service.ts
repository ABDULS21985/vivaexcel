import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DigitalProductsRepository } from '../digital-products.repository';
import { CreateDigitalProductTagDto } from '../dto/create-digital-product-tag.dto';
import { UpdateDigitalProductTagDto } from '../dto/update-digital-product-tag.dto';
import { DigitalProductTag } from '../../../entities/digital-product-tag.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TAG = 'digital-product-tags';

@Injectable()
export class DigitalProductTagsService {
  private readonly logger = new Logger(DigitalProductTagsService.name);

  constructor(
    private readonly repository: DigitalProductsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<ApiResponse<DigitalProductTag[]>> {
    const cacheKey = this.cacheService.generateKey('digital-product-tags', 'list');

    const tags = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllTags(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Digital product tags retrieved successfully',
      data: tags,
    };
  }

  async findById(id: string): Promise<ApiResponse<DigitalProductTag>> {
    const tag = await this.repository.findTagById(id);
    if (!tag) {
      throw new NotFoundException(`Digital product tag with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Digital product tag retrieved successfully',
      data: tag,
    };
  }

  async create(createDto: CreateDigitalProductTagDto): Promise<ApiResponse<DigitalProductTag>> {
    // Check if slug already exists
    const slugExists = await this.repository.tagSlugExists(createDto.slug);
    if (slugExists) {
      throw new ConflictException('Digital product tag slug already exists');
    }

    const tag = await this.repository.createTag(createDto);

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.debug('Invalidated digital product tags cache after create');

    return {
      status: 'success',
      message: 'Digital product tag created successfully',
      data: tag,
    };
  }

  async update(id: string, updateDto: UpdateDigitalProductTagDto): Promise<ApiResponse<DigitalProductTag>> {
    const existing = await this.repository.findTagById(id);
    if (!existing) {
      throw new NotFoundException(`Digital product tag with ID "${id}" not found`);
    }

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugExists = await this.repository.tagSlugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Digital product tag slug already exists');
      }
    }

    const tag = await this.repository.updateTag(id, updateDto);

    // Invalidate cache
    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product-tag:${id}`]);
    this.logger.debug(`Invalidated digital product tags cache after update for tag ${id}`);

    return {
      status: 'success',
      message: 'Digital product tag updated successfully',
      data: tag!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const existing = await this.repository.findTagById(id);
    if (!existing) {
      throw new NotFoundException(`Digital product tag with ID "${id}" not found`);
    }

    await this.repository.softDeleteTag(id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product-tag:${id}`]);
    this.logger.debug(`Invalidated digital product tags cache after delete for tag ${id}`);

    return {
      status: 'success',
      message: 'Digital product tag deleted successfully',
      data: null,
    };
  }
}
