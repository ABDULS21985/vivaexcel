import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async findAllProducts(query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      isFeatured,
      inStock,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    if (inStock === true) {
      qb.andWhere('product.stock > 0');
    } else if (inStock === false) {
      qb.andWhere('product.stock = 0');
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`product.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`product.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`product.${sortBy}`, sortOrder);
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

  async findProductById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findProductBySlug(slug: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, data);
    return this.findProductById(id);
  }

  async softDeleteProduct(id: string): Promise<boolean> {
    const result = await this.productRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async incrementViews(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'views', 1);
  }

  // Category methods
  async findAllCategories(): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<ProductCategory | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async createCategory(data: Partial<ProductCategory>): Promise<ProductCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, data: Partial<ProductCategory>): Promise<ProductCategory | null> {
    await this.categoryRepository.update(id, data);
    return this.findCategoryById(id);
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.productRepository.createQueryBuilder('product')
      .where('product.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('product.id != :excludeId', { excludeId });
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
