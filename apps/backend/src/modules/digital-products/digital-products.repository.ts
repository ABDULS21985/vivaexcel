import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { DigitalProductPreview } from '../../entities/digital-product-preview.entity';
import { DigitalProductQueryDto } from './dto/digital-product-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class DigitalProductsRepository {
  constructor(
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductCategory)
    private readonly categoryRepository: Repository<DigitalProductCategory>,
    @InjectRepository(DigitalProductTag)
    private readonly tagRepository: Repository<DigitalProductTag>,
    @InjectRepository(DigitalProductVariant)
    private readonly variantRepository: Repository<DigitalProductVariant>,
    @InjectRepository(DigitalProductFile)
    private readonly fileRepository: Repository<DigitalProductFile>,
    @InjectRepository(DigitalProductPreview)
    private readonly previewRepository: Repository<DigitalProductPreview>,
  ) { }

  // ──────────────────────────────────────────────
  //  Product methods
  // ──────────────────────────────────────────────

  async findAllProducts(query: DigitalProductQueryDto): Promise<PaginatedResponse<DigitalProduct>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      type,
      categoryId,
      categorySlug,
      tagSlug,
      minPrice,
      maxPrice,
      minRating,
      isFeatured,
      isBestseller,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.creator', 'creator')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.previews', 'previews');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    if (type) {
      qb.andWhere('product.type = :type', { type });
    }

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (tagSlug) {
      qb.andWhere('tags.slug = :tagSlug', { tagSlug });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (minRating !== undefined) {
      qb.andWhere('product.averageRating >= :minRating', { minRating });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    if (isBestseller !== undefined) {
      qb.andWhere('product.isBestseller = :isBestseller', { isBestseller });
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

  async findProductById(id: string): Promise<DigitalProduct | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['creator', 'category', 'tags', 'variants', 'files', 'previews'],
    });
  }

  async findProductBySlug(slug: string): Promise<DigitalProduct | null> {
    return this.productRepository.findOne({
      where: { slug },
      relations: ['creator', 'category', 'tags', 'variants', 'files', 'previews'],
    });
  }

  async createProduct(data: Partial<DigitalProduct>, tagIds?: string[]): Promise<DigitalProduct> {
    const product = this.productRepository.create(data);

    if (tagIds && tagIds.length > 0) {
      product.tags = await this.tagRepository.findBy({ id: In(tagIds) });
    }

    return this.productRepository.save(product);
  }

  async updateProduct(id: string, data: Partial<DigitalProduct>, tagIds?: string[]): Promise<DigitalProduct | null> {
    const product = await this.findProductById(id);
    if (!product) return null;

    Object.assign(product, data);

    if (tagIds !== undefined) {
      product.tags = tagIds.length > 0 ? await this.tagRepository.findBy({ id: In(tagIds) }) : [];
    }

    return this.productRepository.save(product);
  }

  async softDeleteProduct(id: string): Promise<boolean> {
    const result = await this.productRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'viewCount', 1);
  }

  async productSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.productRepository.createQueryBuilder('product')
      .where('product.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('product.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  // ──────────────────────────────────────────────
  //  Category methods
  // ──────────────────────────────────────────────

  async findAllCategories(): Promise<DigitalProductCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<DigitalProductCategory | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<DigitalProductCategory | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async createCategory(data: Partial<DigitalProductCategory>): Promise<DigitalProductCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, data: Partial<DigitalProductCategory>): Promise<DigitalProductCategory | null> {
    await this.categoryRepository.update(id, data);
    return this.findCategoryById(id);
  }

  async softDeleteCategory(id: string): Promise<boolean> {
    const result = await this.categoryRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
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

  // ──────────────────────────────────────────────
  //  Tag methods
  // ──────────────────────────────────────────────

  async findAllTags(): Promise<DigitalProductTag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findTagById(id: string): Promise<DigitalProductTag | null> {
    return this.tagRepository.findOne({ where: { id } });
  }

  async createTag(data: Partial<DigitalProductTag>): Promise<DigitalProductTag> {
    const tag = this.tagRepository.create(data);
    return this.tagRepository.save(tag);
  }

  async updateTag(id: string, data: Partial<DigitalProductTag>): Promise<DigitalProductTag | null> {
    await this.tagRepository.update(id, data);
    return this.findTagById(id);
  }

  async softDeleteTag(id: string): Promise<boolean> {
    const result = await this.tagRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async tagSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.tagRepository.createQueryBuilder('tag')
      .where('tag.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('tag.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  // ──────────────────────────────────────────────
  //  Variant methods
  // ──────────────────────────────────────────────

  async findVariantsByProductId(productId: string): Promise<DigitalProductVariant[]> {
    return this.variantRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createVariant(data: Partial<DigitalProductVariant>): Promise<DigitalProductVariant> {
    const variant = this.variantRepository.create(data);
    return this.variantRepository.save(variant);
  }

  async updateVariant(id: string, data: Partial<DigitalProductVariant>): Promise<DigitalProductVariant | null> {
    const variant = await this.variantRepository.findOne({ where: { id } });
    if (!variant) return null;

    Object.assign(variant, data);
    return this.variantRepository.save(variant);
  }

  async deleteVariant(id: string): Promise<boolean> {
    const result = await this.variantRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  Preview methods
  // ──────────────────────────────────────────────

  async findPreviewsByProductId(productId: string): Promise<DigitalProductPreview[]> {
    return this.previewRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async createPreview(data: Partial<DigitalProductPreview>): Promise<DigitalProductPreview> {
    const preview = this.previewRepository.create(data);
    return this.previewRepository.save(preview);
  }

  async updatePreview(id: string, data: Partial<DigitalProductPreview>): Promise<DigitalProductPreview | null> {
    const preview = await this.previewRepository.findOne({ where: { id } });
    if (!preview) return null;

    Object.assign(preview, data);
    return this.previewRepository.save(preview);
  }

  async deletePreview(id: string): Promise<boolean> {
    const result = await this.previewRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  File methods
  // ──────────────────────────────────────────────

  async findFilesByProductId(productId: string): Promise<DigitalProductFile[]> {
    return this.fileRepository.find({
      where: { productId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async createFile(data: Partial<DigitalProductFile>): Promise<DigitalProductFile> {
    const file = this.fileRepository.create(data);
    return this.fileRepository.save(file);
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await this.fileRepository.delete(id);
    return !!result.affected && result.affected > 0;
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
