import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DigitalProductsRepository } from '../digital-products.repository';
import { CreateDigitalProductDto } from '../dto/create-digital-product.dto';
import { UpdateDigitalProductDto } from '../dto/update-digital-product.dto';
import { CreateDigitalProductVariantDto } from '../dto/create-digital-product-variant.dto';
import { UpdateDigitalProductVariantDto } from '../dto/update-digital-product-variant.dto';
import { CreateDigitalProductPreviewDto } from '../dto/create-digital-product-preview.dto';
import { CreateDigitalProductFileDto } from '../dto/create-digital-product-file.dto';
import { DigitalProductQueryDto } from '../dto/digital-product-query.dto';
import { DigitalProduct, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { DigitalProductVariant } from '../../../entities/digital-product-variant.entity';
import { DigitalProductPreview } from '../../../entities/digital-product-preview.entity';
import { DigitalProductFile } from '../../../entities/digital-product-file.entity';
import { PaginatedResponse, ApiResponse } from '../../../common/interfaces/response.interface';
import { CacheService } from '../../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE = 600; // 10 minutes
const CACHE_TAG = 'digital-products';

@Injectable()
export class DigitalProductsService {
  private readonly logger = new Logger(DigitalProductsService.name);

  constructor(
    private readonly repository: DigitalProductsRepository,
    private readonly cacheService: CacheService,
  ) { }

  // ──────────────────────────────────────────────
  //  Product CRUD
  // ──────────────────────────────────────────────

  async findAll(query: DigitalProductQueryDto): Promise<ApiResponse<PaginatedResponse<DigitalProduct>>> {
    const cacheKey = this.cacheService.generateKey('digital-products', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllProducts(query),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Digital products retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<DigitalProduct>> {
    const cacheKey = this.cacheService.generateKey('digital-products', 'id', id);

    const product = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findProductById(id),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `digital-product:${id}`] },
    );

    if (!product) {
      throw new NotFoundException(`Digital product with ID "${id}" not found`);
    }

    // Increment view count (don't await to not block response)
    this.repository.incrementViewCount(id).catch((err) => {
      this.logger.warn(`Failed to increment view count for product ${id}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Digital product retrieved successfully',
      data: product,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<DigitalProduct>> {
    const cacheKey = this.cacheService.generateKey('digital-products', 'slug', slug);

    const product = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findProductBySlug(slug),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `digital-product:slug:${slug}`] },
    );

    if (!product) {
      throw new NotFoundException(`Digital product with slug "${slug}" not found`);
    }

    // Increment view count (don't await to not block response)
    this.repository.incrementViewCount(product.id).catch((err) => {
      this.logger.warn(`Failed to increment view count for product ${slug}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Digital product retrieved successfully',
      data: product,
    };
  }

  async create(createDto: CreateDigitalProductDto, creatorId: string): Promise<ApiResponse<DigitalProduct>> {
    // Check if slug already exists
    const slugExists = await this.repository.productSlugExists(createDto.slug);
    if (slugExists) {
      throw new ConflictException('Digital product slug already exists');
    }

    const { tagIds, ...productData } = createDto;

    // Handle publishing
    let publishedAt: Date | undefined;
    if (productData.status === DigitalProductStatus.PUBLISHED) {
      publishedAt = new Date();
    }

    const product = await this.repository.createProduct(
      {
        ...productData,
        createdBy: creatorId,
        publishedAt,
      },
      tagIds,
    );

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.debug('Invalidated digital products cache after create');

    return {
      status: 'success',
      message: 'Digital product created successfully',
      data: product,
    };
  }

  async update(id: string, updateDto: UpdateDigitalProductDto): Promise<ApiResponse<DigitalProduct>> {
    const existingProduct = await this.repository.findProductById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Digital product with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateDto.slug && updateDto.slug !== existingProduct.slug) {
      const slugExists = await this.repository.productSlugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Digital product slug already exists');
      }
    }

    const { tagIds, ...productData } = updateDto;

    // Handle status changes
    let publishedAt = existingProduct.publishedAt;
    if (productData.status === DigitalProductStatus.PUBLISHED && !existingProduct.publishedAt) {
      publishedAt = new Date();
    }

    const updatedProduct = await this.repository.updateProduct(
      id,
      {
        ...productData,
        publishedAt,
      },
      tagIds,
    );

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product:${id}`,
      `digital-product:slug:${existingProduct.slug}`,
    ]);
    this.logger.debug(`Invalidated digital products cache after update for product ${id}`);

    return {
      status: 'success',
      message: 'Digital product updated successfully',
      data: updatedProduct!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const product = await this.repository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${id}" not found`);
    }

    await this.repository.softDeleteProduct(id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product:${id}`,
      `digital-product:slug:${product.slug}`,
    ]);
    this.logger.debug(`Invalidated digital products cache after delete for product ${id}`);

    return {
      status: 'success',
      message: 'Digital product deleted successfully',
      data: null,
    };
  }

  async publish(id: string): Promise<ApiResponse<DigitalProduct>> {
    const product = await this.repository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${id}" not found`);
    }

    const updatedProduct = await this.repository.updateProduct(id, {
      status: DigitalProductStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product:${id}`,
      `digital-product:slug:${product.slug}`,
    ]);
    this.logger.debug(`Invalidated digital products cache after publish for product ${id}`);

    return {
      status: 'success',
      message: 'Digital product published successfully',
      data: updatedProduct!,
    };
  }

  async archive(id: string): Promise<ApiResponse<DigitalProduct>> {
    const product = await this.repository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${id}" not found`);
    }

    const updatedProduct = await this.repository.updateProduct(id, {
      status: DigitalProductStatus.ARCHIVED,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `digital-product:${id}`,
      `digital-product:slug:${product.slug}`,
    ]);
    this.logger.debug(`Invalidated digital products cache after archive for product ${id}`);

    return {
      status: 'success',
      message: 'Digital product archived successfully',
      data: updatedProduct!,
    };
  }

  // ──────────────────────────────────────────────
  //  Variant operations
  // ──────────────────────────────────────────────

  async createVariant(productId: string, dto: CreateDigitalProductVariantDto): Promise<ApiResponse<DigitalProductVariant>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const variant = await this.repository.createVariant({
      ...dto,
      productId,
    });

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Created variant for product ${productId}`);

    return {
      status: 'success',
      message: 'Product variant created successfully',
      data: variant,
    };
  }

  async updateVariant(productId: string, variantId: string, dto: UpdateDigitalProductVariantDto): Promise<ApiResponse<DigitalProductVariant>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const variant = await this.repository.updateVariant(variantId, dto);
    if (!variant) {
      throw new NotFoundException(`Variant with ID "${variantId}" not found`);
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Updated variant ${variantId} for product ${productId}`);

    return {
      status: 'success',
      message: 'Product variant updated successfully',
      data: variant,
    };
  }

  async deleteVariant(productId: string, variantId: string): Promise<ApiResponse<null>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const deleted = await this.repository.deleteVariant(variantId);
    if (!deleted) {
      throw new NotFoundException(`Variant with ID "${variantId}" not found`);
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Deleted variant ${variantId} for product ${productId}`);

    return {
      status: 'success',
      message: 'Product variant deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Preview operations
  // ──────────────────────────────────────────────

  async createPreview(productId: string, dto: CreateDigitalProductPreviewDto): Promise<ApiResponse<DigitalProductPreview>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const preview = await this.repository.createPreview({
      ...dto,
      productId,
    });

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Created preview for product ${productId}`);

    return {
      status: 'success',
      message: 'Product preview created successfully',
      data: preview,
    };
  }

  async deletePreview(productId: string, previewId: string): Promise<ApiResponse<null>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const deleted = await this.repository.deletePreview(previewId);
    if (!deleted) {
      throw new NotFoundException(`Preview with ID "${previewId}" not found`);
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Deleted preview ${previewId} for product ${productId}`);

    return {
      status: 'success',
      message: 'Product preview deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  File operations
  // ──────────────────────────────────────────────

  async createFile(productId: string, dto: CreateDigitalProductFileDto): Promise<ApiResponse<DigitalProductFile>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const file = await this.repository.createFile({
      ...dto,
      productId,
    });

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Created file record for product ${productId}`);

    return {
      status: 'success',
      message: 'Product file created successfully',
      data: file,
    };
  }

  async deleteFile(productId: string, fileId: string): Promise<ApiResponse<null>> {
    const product = await this.repository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    const deleted = await this.repository.deleteFile(fileId);
    if (!deleted) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, `digital-product:${productId}`]);
    this.logger.debug(`Deleted file ${fileId} for product ${productId}`);

    return {
      status: 'success',
      message: 'Product file deleted successfully',
      data: null,
    };
  }
}
