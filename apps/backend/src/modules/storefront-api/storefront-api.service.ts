import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import {
  DigitalProduct,
  DigitalProductStatus,
} from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { Review } from '../../entities/review.entity';
import { SellerProfile, SellerStatus } from '../../entities/seller-profile.entity';
import { Cart, CartStatus } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { ReviewStatus } from '../reviews/enums/review.enums';

import {
  StorefrontProductsQueryDto,
  StorefrontSearchQueryDto,
  StorefrontReviewsQueryDto,
} from './dto/storefront-query.dto';
import { AddCartItemDto } from './dto/cart-item.dto';
import { CreateCheckoutDto } from './dto/checkout.dto';
import {
  StorefrontResponse,
  StorefrontPaginationMeta,
} from './interfaces/storefront-response.interface';

@Injectable()
export class StorefrontApiService {
  private readonly logger = new Logger(StorefrontApiService.name);
  private readonly stripe: Stripe | null;

  constructor(
    @InjectRepository(DigitalProduct)
    private readonly productRepository: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductCategory)
    private readonly categoryRepository: Repository<DigitalProductCategory>,
    @InjectRepository(DigitalProductVariant)
    private readonly variantRepository: Repository<DigitalProductVariant>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(SellerProfile)
    private readonly sellerRepository: Repository<SellerProfile>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia',
      });
    } else {
      this.stripe = null;
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured. Storefront checkout will not work.',
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Products
  // ──────────────────────────────────────────────

  /**
   * List published products with cursor-based pagination and filtering.
   */
  async listProducts(
    query: StorefrontProductsQueryDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any[]>> {
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.status = :status', { status: DigitalProductStatus.PUBLISHED })
      .andWhere('product.deletedAt IS NULL');

    // Cursor pagination
    if (query.cursor) {
      const cursorProduct = await this.productRepository.findOne({
        where: { id: query.cursor },
      });
      if (cursorProduct) {
        const op = sortOrder === 'DESC' ? '<' : '>';
        qb.andWhere(`product.${this.sanitizeSortField(sortBy)} ${op} :cursorValue`, {
          cursorValue: (cursorProduct as any)[this.sanitizeSortField(sortBy)],
        });
      }
    }

    // Filters
    if (query.category) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: query.category });
    }

    if (query.type) {
      qb.andWhere('product.type = :type', { type: query.type });
    }

    if (query.priceMin !== undefined) {
      qb.andWhere('product.price >= :priceMin', { priceMin: query.priceMin });
    }

    if (query.priceMax !== undefined) {
      qb.andWhere('product.price <= :priceMax', { priceMax: query.priceMax });
    }

    if (query.search) {
      qb.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Count total
    const total = await qb.getCount();

    // Apply sorting and limit
    qb.orderBy(
      `product.${this.sanitizeSortField(sortBy)}`,
      sortOrder as 'ASC' | 'DESC',
    );
    qb.take(limit + 1); // Fetch one extra to check for hasMore

    const products = await qb.getMany();
    const hasMore = products.length > limit;
    if (hasMore) {
      products.pop(); // Remove the extra item
    }

    const lastItem = products[products.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.id : undefined;

    const data = products.map((p) => this.formatProduct(p));

    const meta: StorefrontPaginationMeta = {
      total,
      hasMore,
      cursor: nextCursor,
    };

    const links: any = {
      self: `${baseUrl}/storefront/products`,
    };
    if (nextCursor) {
      links.next = `${baseUrl}/storefront/products?cursor=${nextCursor}&limit=${limit}`;
    }

    return { data, meta, links };
  }

  /**
   * Get a single product by slug.
   */
  async getProductBySlug(
    slug: string,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const product = await this.productRepository.findOne({
      where: { slug, status: DigitalProductStatus.PUBLISHED },
      relations: ['category', 'tags', 'variants', 'previews', 'creator'],
    });

    if (!product) {
      throw new NotFoundException({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with slug "${slug}" not found.`,
          status: 404,
        },
      });
    }

    return {
      data: this.formatProductDetail(product),
      links: { self: `${baseUrl}/storefront/products/${slug}` },
    };
  }

  /**
   * Get reviews for a product by slug (cursor paginated).
   */
  async getProductReviews(
    slug: string,
    query: StorefrontReviewsQueryDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any[]>> {
    // Find product by slug
    const product = await this.productRepository.findOne({
      where: { slug, status: DigitalProductStatus.PUBLISHED },
    });

    if (!product) {
      throw new NotFoundException({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with slug "${slug}" not found.`,
          status: 404,
        },
      });
    }

    const limit = query.limit ?? 20;

    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.digitalProductId = :productId', { productId: product.id })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED });

    if (query.cursor) {
      qb.andWhere('review.id < :cursor', { cursor: query.cursor });
    }

    const total = await qb.getCount();

    qb.orderBy('review.createdAt', 'DESC');
    qb.take(limit + 1);

    const reviews = await qb.getMany();
    const hasMore = reviews.length > limit;
    if (hasMore) {
      reviews.pop();
    }

    const lastItem = reviews[reviews.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.id : undefined;

    const data = reviews.map((r) => this.formatReview(r));

    const meta: StorefrontPaginationMeta = {
      total,
      hasMore,
      cursor: nextCursor,
    };

    const links: any = {
      self: `${baseUrl}/storefront/products/${slug}/reviews`,
    };
    if (nextCursor) {
      links.next = `${baseUrl}/storefront/products/${slug}/reviews?cursor=${nextCursor}&limit=${limit}`;
    }

    return { data, meta, links };
  }

  // ──────────────────────────────────────────────
  //  Categories
  // ──────────────────────────────────────────────

  /**
   * List active product categories.
   */
  async listCategories(
    baseUrl: string,
  ): Promise<StorefrontResponse<any[]>> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { order: 'ASC', name: 'ASC' },
      relations: ['children'],
    });

    const data = categories.map((c) => this.formatCategory(c));

    return {
      data,
      links: { self: `${baseUrl}/storefront/categories` },
    };
  }

  // ──────────────────────────────────────────────
  //  Search
  // ──────────────────────────────────────────────

  /**
   * Full-text search across products.
   */
  async searchProducts(
    query: StorefrontSearchQueryDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any[]>> {
    const limit = query.limit ?? 20;
    const searchTerm = query.q ?? '';

    if (!searchTerm.trim()) {
      return {
        data: [],
        meta: { total: 0, hasMore: false },
        links: { self: `${baseUrl}/storefront/search` },
      };
    }

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .where('product.status = :status', { status: DigitalProductStatus.PUBLISHED })
      .andWhere('product.deletedAt IS NULL')
      .andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${searchTerm}%` },
      );

    if (query.cursor) {
      qb.andWhere('product.id < :cursor', { cursor: query.cursor });
    }

    const total = await qb.getCount();

    qb.orderBy('product.createdAt', 'DESC');
    qb.take(limit + 1);

    const products = await qb.getMany();
    const hasMore = products.length > limit;
    if (hasMore) {
      products.pop();
    }

    const lastItem = products[products.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.id : undefined;

    const data = products.map((p) => this.formatProduct(p));

    const meta: StorefrontPaginationMeta = {
      total,
      hasMore,
      cursor: nextCursor,
    };

    const links: any = {
      self: `${baseUrl}/storefront/search?q=${encodeURIComponent(searchTerm)}`,
    };
    if (nextCursor) {
      links.next = `${baseUrl}/storefront/search?q=${encodeURIComponent(searchTerm)}&cursor=${nextCursor}&limit=${limit}`;
    }

    return { data, meta, links };
  }

  // ──────────────────────────────────────────────
  //  Cart (session-based, no auth required)
  // ──────────────────────────────────────────────

  /**
   * Create a new session-based cart.
   */
  async createCart(
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const sessionId = nanoid(21);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const cart = this.cartRepository.create({
      sessionId,
      status: CartStatus.ACTIVE,
      expiresAt,
      currency: 'USD',
    });

    const saved = await this.cartRepository.save(cart);

    this.logger.log(`Storefront cart created: ${saved.id}, session=${sessionId}`);

    return {
      data: this.formatCart(saved, []),
      links: { self: `${baseUrl}/storefront/cart/${saved.id}` },
    };
  }

  /**
   * Add an item to a session-based cart.
   */
  async addCartItem(
    cartId: string,
    dto: AddCartItemDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const cart = await this.findActiveCart(cartId);

    // Verify the product
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID "${dto.productId}" not found.`,
          status: 404,
        },
      });
    }

    if (product.status !== DigitalProductStatus.PUBLISHED) {
      throw new BadRequestException({
        error: {
          code: 'PRODUCT_UNAVAILABLE',
          message: 'This product is not currently available for purchase.',
          status: 400,
        },
      });
    }

    // If variant specified, verify it
    let variant: DigitalProductVariant | null = null;
    if (dto.variantId) {
      variant = await this.variantRepository.findOne({
        where: { id: dto.variantId, productId: dto.productId },
      });

      if (!variant) {
        throw new NotFoundException({
          error: {
            code: 'VARIANT_NOT_FOUND',
            message: `Variant with ID "${dto.variantId}" not found for this product.`,
            status: 404,
          },
        });
      }
    }

    // Check for duplicate
    const existing = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        digitalProductId: dto.productId,
        variantId: dto.variantId ?? undefined,
      },
    });

    if (existing) {
      // Return current cart state (idempotent)
      return this.getCart(cartId, baseUrl);
    }

    const unitPrice = variant ? Number(variant.price) : Number(product.price);
    const currency = product.currency;

    const item = this.cartItemRepository.create({
      cartId: cart.id,
      digitalProductId: dto.productId,
      variantId: dto.variantId ?? undefined,
      quantity: dto.quantity ?? 1,
      unitPrice,
      currency,
    });

    await this.cartItemRepository.save(item);

    this.logger.debug(
      `Added item to storefront cart ${cart.id}: product=${dto.productId}, variant=${dto.variantId}`,
    );

    return this.getCart(cartId, baseUrl);
  }

  /**
   * Remove an item from a cart.
   */
  async removeCartItem(
    cartId: string,
    itemId: string,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const cart = await this.findActiveCart(cartId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException({
        error: {
          code: 'CART_ITEM_NOT_FOUND',
          message: `Cart item with ID "${itemId}" not found in this cart.`,
          status: 404,
        },
      });
    }

    await this.cartItemRepository.remove(item);

    this.logger.debug(`Removed item ${itemId} from storefront cart ${cart.id}`);

    return this.getCart(cartId, baseUrl);
  }

  /**
   * Get cart with all items.
   */
  async getCart(
    cartId: string,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.digitalProduct',
        'items.digitalProduct.category',
        'items.variant',
      ],
    });

    if (!cart) {
      throw new NotFoundException({
        error: {
          code: 'CART_NOT_FOUND',
          message: `Cart with ID "${cartId}" not found.`,
          status: 404,
        },
      });
    }

    const items = cart.items ?? [];

    return {
      data: this.formatCart(cart, items),
      links: { self: `${baseUrl}/storefront/cart/${cartId}` },
    };
  }

  // ──────────────────────────────────────────────
  //  Checkout
  // ──────────────────────────────────────────────

  /**
   * Create a Stripe Checkout session from a storefront cart.
   */
  async createCheckout(
    dto: CreateCheckoutDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    if (!this.stripe) {
      throw new InternalServerErrorException({
        error: {
          code: 'STRIPE_NOT_CONFIGURED',
          message: 'Payment processing is not configured.',
          status: 500,
        },
      });
    }

    // Load cart with items
    const cart = await this.cartRepository.findOne({
      where: { id: dto.cartId, status: CartStatus.ACTIVE },
      relations: [
        'items',
        'items.digitalProduct',
        'items.variant',
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException({
        error: {
          code: 'CART_EMPTY',
          message: 'Cart is empty or not found. Add items before checking out.',
          status: 400,
        },
      });
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => {
        const unitPrice = Number(item.unitPrice);
        const productName = item.digitalProduct?.title || 'Digital Product';
        const variantName = item.variant?.name;
        const description = variantName
          ? `Variant: ${variantName}`
          : undefined;

        return {
          price_data: {
            currency: (item.currency || cart.currency || 'USD').toLowerCase(),
            product_data: {
              name: productName,
              ...(description ? { description } : {}),
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity: item.quantity || 1,
        };
      });

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        metadata: {
          type: 'digital_product_purchase',
          cartId: cart.id,
          source: 'storefront_api',
        },
        success_url: `${dto.successUrl}${dto.successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: dto.cancelUrl,
      });

      this.logger.log(
        `Storefront checkout session created: ${session.id} for cart ${cart.id}`,
      );

      return {
        data: {
          sessionId: session.id,
          url: session.url,
          cartId: cart.id,
        },
        links: { self: `${baseUrl}/storefront/checkout` },
      };
    } catch (error) {
      this.logger.error(
        `Failed to create storefront checkout session for cart ${cart.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException({
        error: {
          code: 'CHECKOUT_FAILED',
          message: 'Failed to create checkout session. Please try again.',
          status: 500,
        },
      });
    }
  }

  // ──────────────────────────────────────────────
  //  Sellers
  // ──────────────────────────────────────────────

  /**
   * Get a public seller profile by slug.
   */
  async getSellerBySlug(
    slug: string,
    baseUrl: string,
  ): Promise<StorefrontResponse<any>> {
    const seller = await this.sellerRepository.findOne({
      where: { slug, status: SellerStatus.APPROVED },
      relations: ['user'],
    });

    if (!seller) {
      throw new NotFoundException({
        error: {
          code: 'SELLER_NOT_FOUND',
          message: `Seller with slug "${slug}" not found.`,
          status: 404,
        },
      });
    }

    return {
      data: this.formatSeller(seller),
      links: { self: `${baseUrl}/storefront/sellers/${slug}` },
    };
  }

  /**
   * Get products by a specific seller.
   */
  async getSellerProducts(
    slug: string,
    query: StorefrontProductsQueryDto,
    baseUrl: string,
  ): Promise<StorefrontResponse<any[]>> {
    const seller = await this.sellerRepository.findOne({
      where: { slug, status: SellerStatus.APPROVED },
    });

    if (!seller) {
      throw new NotFoundException({
        error: {
          code: 'SELLER_NOT_FOUND',
          message: `Seller with slug "${slug}" not found.`,
          status: 404,
        },
      });
    }

    const limit = query.limit ?? 20;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.status = :status', { status: DigitalProductStatus.PUBLISHED })
      .andWhere('product.createdBy = :sellerId', { sellerId: seller.userId })
      .andWhere('product.deletedAt IS NULL');

    if (query.cursor) {
      qb.andWhere('product.id < :cursor', { cursor: query.cursor });
    }

    const total = await qb.getCount();

    qb.orderBy('product.createdAt', 'DESC');
    qb.take(limit + 1);

    const products = await qb.getMany();
    const hasMore = products.length > limit;
    if (hasMore) {
      products.pop();
    }

    const lastItem = products[products.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.id : undefined;

    const data = products.map((p) => this.formatProduct(p));

    const meta: StorefrontPaginationMeta = {
      total,
      hasMore,
      cursor: nextCursor,
    };

    const links: any = {
      self: `${baseUrl}/storefront/sellers/${slug}/products`,
    };
    if (nextCursor) {
      links.next = `${baseUrl}/storefront/sellers/${slug}/products?cursor=${nextCursor}&limit=${limit}`;
    }

    return { data, meta, links };
  }

  // ──────────────────────────────────────────────
  //  Private Helpers: Formatting
  // ──────────────────────────────────────────────

  private formatProduct(product: DigitalProduct): any {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      type: product.type,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      currency: product.currency,
      featuredImage: product.featuredImage,
      averageRating: Number(product.averageRating),
      totalReviews: product.totalReviews,
      isFeatured: product.isFeatured,
      isBestseller: product.isBestseller,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      tags: (product.tags ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      variants: (product.variants ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        features: v.features,
      })),
      createdAt: product.createdAt,
    };
  }

  private formatProductDetail(product: DigitalProduct): any {
    return {
      ...this.formatProduct(product),
      description: product.description,
      galleryImages: product.galleryImages,
      downloadCount: product.downloadCount,
      viewCount: product.viewCount,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      previews: (product.previews ?? []).map((p) => ({
        id: p.id,
      })),
      publishedAt: product.publishedAt,
    };
  }

  private formatCategory(category: DigitalProductCategory): any {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      order: category.order,
      children: (category.children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
    };
  }

  private formatReview(review: Review): any {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      pros: review.pros,
      cons: review.cons,
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulCount: review.helpfulCount,
      images: review.images,
      author: review.user
        ? {
            id: review.user.id,
            name: review.user.name,
          }
        : null,
      sellerResponse: review.sellerResponse,
      sellerRespondedAt: review.sellerRespondedAt,
      createdAt: review.createdAt,
    };
  }

  private formatSeller(seller: SellerProfile): any {
    return {
      id: seller.id,
      displayName: seller.displayName,
      slug: seller.slug,
      bio: seller.bio,
      avatar: seller.avatar,
      coverImage: seller.coverImage,
      website: seller.website,
      socialLinks: seller.socialLinks,
      totalSales: seller.totalSales,
      averageRating: Number(seller.averageRating),
      verificationStatus: seller.verificationStatus,
      specialties: seller.specialties,
      createdAt: seller.createdAt,
    };
  }

  private formatCart(cart: Cart, items: CartItem[]): any {
    const formattedItems = items.map((item) => ({
      id: item.id,
      productId: item.digitalProductId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      currency: item.currency,
      product: item.digitalProduct
        ? {
            id: item.digitalProduct.id,
            title: item.digitalProduct.title,
            slug: item.digitalProduct.slug,
            featuredImage: item.digitalProduct.featuredImage,
            category: item.digitalProduct.category
              ? {
                  id: item.digitalProduct.category.id,
                  name: item.digitalProduct.category.name,
                  slug: item.digitalProduct.category.slug,
                }
              : null,
          }
        : null,
      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            price: Number(item.variant.price),
          }
        : null,
    }));

    // Calculate summary
    const subtotal =
      items.reduce((sum, item) => {
        return sum + Math.round(Number(item.unitPrice) * 100) * item.quantity;
      }, 0) / 100;

    const total = Math.round(subtotal * 100) / 100;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      status: cart.status,
      currency: cart.currency,
      items: formattedItems,
      summary: {
        subtotal,
        total,
        itemCount,
        currency: cart.currency,
      },
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
    };
  }

  // ──────────────────────────────────────────────
  //  Private Helpers: Utilities
  // ──────────────────────────────────────────────

  private async findActiveCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, status: CartStatus.ACTIVE },
    });

    if (!cart) {
      throw new NotFoundException({
        error: {
          code: 'CART_NOT_FOUND',
          message: `Active cart with ID "${cartId}" not found.`,
          status: 404,
        },
      });
    }

    return cart;
  }

  /**
   * Sanitize sort field to prevent SQL injection.
   * Only allow known column names.
   */
  private sanitizeSortField(field: string): string {
    const allowedFields: Record<string, string> = {
      createdAt: 'createdAt',
      price: 'price',
      title: 'title',
      averageRating: 'averageRating',
      totalReviews: 'totalReviews',
      downloadCount: 'downloadCount',
      viewCount: 'viewCount',
    };

    return allowedFields[field] ?? 'createdAt';
  }
}
