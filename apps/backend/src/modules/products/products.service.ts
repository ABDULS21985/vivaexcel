import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductCategoryDto } from './dto/create-category.dto';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';
import { CacheService } from '../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_PRODUCTS_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE_PRODUCT = 600; // 10 minutes
const CACHE_TTL_CATEGORIES = 600; // 10 minutes
const CACHE_TAG_PRODUCTS = 'products';
const CACHE_TAG_PRODUCT_CATEGORIES = 'product-categories';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: ProductQueryDto): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const cacheKey = this.cacheService.generateKey('products', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findAllProducts(query),
      { ttl: CACHE_TTL_PRODUCTS_LIST, tags: [CACHE_TAG_PRODUCTS] },
    );

    return {
      status: 'success',
      message: 'Products retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<Product>> {
    const cacheKey = this.cacheService.generateKey('products', 'id', id);

    const product = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findProductById(id),
      { ttl: CACHE_TTL_SINGLE_PRODUCT, tags: [CACHE_TAG_PRODUCTS, `product:${id}`] },
    );

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Increment views (don't await to not block response)
    this.productsRepository.incrementViews(id).catch((err) => {
      this.logger.warn(`Failed to increment views for product ${id}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<Product>> {
    const cacheKey = this.cacheService.generateKey('products', 'slug', slug);

    const product = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findProductBySlug(slug),
      { ttl: CACHE_TTL_SINGLE_PRODUCT, tags: [CACHE_TAG_PRODUCTS, `product:slug:${slug}`] },
    );

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    // Increment views (don't await to not block response)
    this.productsRepository.incrementViews(product.id).catch((err) => {
      this.logger.warn(`Failed to increment views for product ${slug}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async create(createProductDto: CreateProductDto, userId?: string): Promise<ApiResponse<Product>> {
    // Check if slug already exists
    const slugExists = await this.productsRepository.slugExists(createProductDto.slug);
    if (slugExists) {
      throw new ConflictException('Product slug already exists');
    }

    const product = await this.productsRepository.createProduct({
      ...createProductDto,
      createdBy: userId,
    });

    // Invalidate products cache
    await this.cacheService.invalidateByTag(CACHE_TAG_PRODUCTS);
    this.logger.debug('Invalidated products cache after create');

    return {
      status: 'success',
      message: 'Product created successfully',
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ApiResponse<Product>> {
    const existingProduct = await this.productsRepository.findProductById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateProductDto.slug && updateProductDto.slug !== existingProduct.slug) {
      const slugExists = await this.productsRepository.slugExists(updateProductDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Product slug already exists');
      }
    }

    const updatedProduct = await this.productsRepository.updateProduct(id, updateProductDto);

    // Invalidate products cache and specific product cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PRODUCTS,
      `product:${id}`,
      `product:slug:${existingProduct.slug}`,
    ]);
    this.logger.debug(`Invalidated products cache after update for product ${id}`);

    return {
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    await this.productsRepository.softDeleteProduct(id);

    // Invalidate products cache and specific product cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_PRODUCTS,
      `product:${id}`,
      `product:slug:${product.slug}`,
    ]);
    this.logger.debug(`Invalidated products cache after delete for product ${id}`);

    return {
      status: 'success',
      message: 'Product deleted successfully',
      data: null,
    };
  }

  // Category methods
  async findAllCategories(): Promise<ApiResponse<ProductCategory[]>> {
    const cacheKey = this.cacheService.generateKey('products', 'categories', 'all');

    const categories = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findAllCategories(),
      { ttl: CACHE_TTL_CATEGORIES, tags: [CACHE_TAG_PRODUCT_CATEGORIES] },
    );

    return {
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async createCategory(createCategoryDto: CreateProductCategoryDto): Promise<ApiResponse<ProductCategory>> {
    // Check if slug already exists
    const slugExists = await this.productsRepository.categorySlugExists(createCategoryDto.slug);
    if (slugExists) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.productsRepository.createCategory(createCategoryDto);

    // Invalidate categories cache
    await this.cacheService.invalidateByTag(CACHE_TAG_PRODUCT_CATEGORIES);
    this.logger.debug('Invalidated product categories cache after create');

    return {
      status: 'success',
      message: 'Category created successfully',
      data: category,
    };
  }

  async findCategoryById(id: string): Promise<ApiResponse<ProductCategory>> {
    const cacheKey = this.cacheService.generateKey('products', 'category', 'id', id);

    const category = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findCategoryById(id),
      { ttl: CACHE_TTL_CATEGORIES, tags: [CACHE_TAG_PRODUCT_CATEGORIES, `product-category:${id}`] },
    );

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async findCategoryBySlug(slug: string): Promise<ApiResponse<ProductCategory>> {
    const cacheKey = this.cacheService.generateKey('products', 'category', 'slug', slug);

    const category = await this.cacheService.wrap(
      cacheKey,
      () => this.productsRepository.findCategoryBySlug(slug),
      { ttl: CACHE_TTL_CATEGORIES, tags: [CACHE_TAG_PRODUCT_CATEGORIES, `product-category:slug:${slug}`] },
    );

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }
}
