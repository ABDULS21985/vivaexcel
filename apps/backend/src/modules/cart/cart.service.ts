import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Cart, CartStatus } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import {
  DigitalProduct,
  DigitalProductStatus,
} from '../../entities/digital-product.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { RedisService } from '../../shared/redis/redis.service';
import { ApiResponse } from '../../common/interfaces/response.interface';

// Redis key patterns
const REDIS_KEY_USER_CART = (userId: string) => `cart:user:${userId}`;
const REDIS_KEY_SESSION_CART = (sessionId: string) =>
  `cart:session:${sessionId}`;

// TTL constants
const REDIS_CART_TTL = 900; // 15 minutes
const CART_EXPIRY_HOURS = 24;

export interface CartSummary {
  subtotal: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  currency: string;
}

export interface CartWithSummary {
  cart: Cart;
  summary: CartSummary;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductVariant)
    private readonly variantRepository: Repository<DigitalProductVariant>,
    private readonly redisService: RedisService,
  ) {}

  // ──────────────────────────────────────────────
  //  Core cart operations
  // ──────────────────────────────────────────────

  /**
   * Get an existing active cart or create a new one.
   * Uses Redis to cache the cart ID for fast lookups.
   */
  async getOrCreateCart(
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    // Try to resolve cart from Redis first, then DB, then create new
    if (userId) {
      return this.getOrCreateUserCart(userId);
    }

    if (sessionId) {
      return this.getOrCreateSessionCart(sessionId);
    }

    // No userId or sessionId: create a new anonymous cart with a generated sessionId
    const generatedSessionId = nanoid(21);
    return this.createNewCart(undefined, generatedSessionId);
  }

  /**
   * Get the cart with all items loaded (including product/variant relations)
   * and a computed summary.
   */
  async getCartWithItems(
    userId?: string,
    sessionId?: string,
  ): Promise<CartWithSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const cartWithItems = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: [
        'items',
        'items.digitalProduct',
        'items.digitalProduct.category',
        'items.digitalProduct.tags',
        'items.variant',
      ],
    });

    if (!cartWithItems) {
      throw new NotFoundException('Cart not found');
    }

    const summary = this.getCartSummary(cartWithItems);

    return { cart: cartWithItems, summary };
  }

  /**
   * Add an item to the cart. Idempotent: if the same product+variant
   * combination already exists, the existing cart is returned unchanged.
   */
  async addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    variantId?: string,
  ): Promise<CartWithSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Verify the product exists and is published
    const product = await this.digitalProductRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException(
        `Digital product with ID "${productId}" not found`,
      );
    }

    if (product.status !== DigitalProductStatus.PUBLISHED) {
      throw new BadRequestException(
        'This product is not currently available for purchase',
      );
    }

    // If a variant is specified, verify it exists and belongs to this product
    let variant: DigitalProductVariant | null = null;
    if (variantId) {
      variant = await this.variantRepository.findOne({
        where: { id: variantId, productId },
      });

      if (!variant) {
        throw new NotFoundException(
          `Variant with ID "${variantId}" not found for product "${productId}"`,
        );
      }
    }

    // Check if the item already exists in the cart (idempotent)
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        digitalProductId: productId,
        variantId: variantId ?? undefined,
      },
    });

    if (existingItem) {
      // Item already in cart, return current state
      this.logger.debug(
        `Item already in cart ${cart.id}: product=${productId}, variant=${variantId}`,
      );
      return this.getCartWithItems(userId, sessionId);
    }

    // Determine the price: use variant price if variant selected, otherwise product base price
    const unitPrice = variant ? Number(variant.price) : Number(product.price);
    const currency = product.currency;

    // Create the cart item with snapshotted price
    const cartItem = this.cartItemRepository.create({
      cartId: cart.id,
      digitalProductId: productId,
      variantId: variantId ?? undefined,
      quantity: 1,
      unitPrice,
      currency,
    });

    await this.cartItemRepository.save(cartItem);

    this.logger.debug(
      `Added item to cart ${cart.id}: product=${productId}, variant=${variantId}, price=${unitPrice}`,
    );

    // Invalidate Redis cache for this cart
    await this.invalidateCartCache(userId, sessionId);

    return this.getCartWithItems(userId, sessionId);
  }

  /**
   * Remove a specific item from the cart.
   */
  async removeItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string,
  ): Promise<CartWithSummary> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException(
        `Cart item with ID "${itemId}" not found in your cart`,
      );
    }

    await this.cartItemRepository.remove(item);

    this.logger.debug(`Removed item ${itemId} from cart ${cart.id}`);

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);

    return this.getCartWithItems(userId, sessionId);
  }

  /**
   * Clear all items from the cart.
   */
  async clearCart(
    userId: string | undefined,
    sessionId: string | undefined,
  ): Promise<void> {
    const cart = await this.findActiveCart(userId, sessionId);

    if (!cart) {
      return; // No active cart, nothing to clear
    }

    // Remove all items from the cart
    await this.cartItemRepository.delete({ cartId: cart.id });

    this.logger.debug(`Cleared all items from cart ${cart.id}`);

    // Invalidate cache
    await this.invalidateCartCache(userId, sessionId);
  }

  /**
   * Merge a guest cart into a user's cart after login.
   * Items from the guest cart that do not already exist in the user cart
   * are moved over. The guest cart is marked as MERGED.
   */
  async mergeGuestCart(
    userId: string,
    sessionId: string,
  ): Promise<CartWithSummary> {
    // Find the guest cart
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId, status: CartStatus.ACTIVE },
      relations: ['items'],
    });

    if (!guestCart) {
      this.logger.debug(
        `No active guest cart found for session ${sessionId}, returning user cart`,
      );
      return this.getCartWithItems(userId, undefined);
    }

    // Get or create the user cart
    const userCart = await this.getOrCreateUserCart(userId);

    // Load user cart items
    const userCartItems = await this.cartItemRepository.find({
      where: { cartId: userCart.id },
    });

    // Build a set of existing product+variant combos in user cart for fast lookup
    const existingCombos = new Set(
      userCartItems.map(
        (item) => `${item.digitalProductId}:${item.variantId ?? 'null'}`,
      ),
    );

    // Move non-duplicate items from guest cart to user cart
    for (const guestItem of guestCart.items) {
      const combo = `${guestItem.digitalProductId}:${guestItem.variantId ?? 'null'}`;

      if (!existingCombos.has(combo)) {
        // Move item to user cart
        guestItem.cartId = userCart.id;
        await this.cartItemRepository.save(guestItem);

        this.logger.debug(
          `Moved item ${guestItem.id} from guest cart ${guestCart.id} to user cart ${userCart.id}`,
        );
      }
    }

    // Mark guest cart as merged
    guestCart.status = CartStatus.MERGED;
    await this.cartRepository.save(guestCart);

    // Clear guest cart from Redis
    const guestRedisKey = REDIS_KEY_SESSION_CART(sessionId);
    await this.safeRedisDelete(guestRedisKey);

    // Refresh user cart in Redis
    const userRedisKey = REDIS_KEY_USER_CART(userId);
    await this.safeRedisSet(userRedisKey, userCart.id, REDIS_CART_TTL);

    this.logger.debug(
      `Merged guest cart ${guestCart.id} into user cart ${userCart.id}`,
    );

    return this.getCartWithItems(userId, undefined);
  }

  /**
   * Compute the cart summary from loaded cart items.
   */
  getCartSummary(cart: Cart): CartSummary {
    const items = cart.items ?? [];

    // Use precise decimal arithmetic to avoid floating point issues
    const subtotal = items.reduce((sum, item) => {
      const lineTotal =
        Math.round(Number(item.unitPrice) * 100) * item.quantity;
      return sum + lineTotal;
    }, 0) / 100;

    const discountAmount = 0; // Placeholder for future coupon system
    const total = Math.round((subtotal - discountAmount) * 100) / 100;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      total,
      itemCount,
      currency: cart.currency,
    };
  }

  /**
   * Mark a cart as converted (e.g. after successful checkout).
   */
  async markCartConverted(cartId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }

    cart.status = CartStatus.CONVERTED;
    await this.cartRepository.save(cart);

    // Invalidate cache
    await this.invalidateCartCache(cart.userId, cart.sessionId);

    this.logger.debug(`Cart ${cartId} marked as converted`);
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Get or create a cart for an authenticated user.
   * Checks Redis first, falls back to DB, creates new if needed.
   */
  private async getOrCreateUserCart(userId: string): Promise<Cart> {
    const redisKey = REDIS_KEY_USER_CART(userId);

    // Check Redis for cached cart ID
    const cachedCartId = await this.safeRedisGet(redisKey);
    if (cachedCartId) {
      const cart = await this.cartRepository.findOne({
        where: { id: cachedCartId, status: CartStatus.ACTIVE },
      });

      if (cart) {
        // Refresh Redis TTL
        await this.safeRedisExpire(redisKey, REDIS_CART_TTL);
        return cart;
      }
    }

    // Check DB for existing active cart
    const existingCart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    if (existingCart) {
      // Cache in Redis and refresh expiry
      await this.safeRedisSet(redisKey, existingCart.id, REDIS_CART_TTL);
      return existingCart;
    }

    // Create new cart for user
    return this.createNewCart(userId, undefined);
  }

  /**
   * Get or create a cart for a guest session.
   * Checks Redis first, falls back to DB, creates new if needed.
   */
  private async getOrCreateSessionCart(sessionId: string): Promise<Cart> {
    const redisKey = REDIS_KEY_SESSION_CART(sessionId);

    // Check Redis for cached cart ID
    const cachedCartId = await this.safeRedisGet(redisKey);
    if (cachedCartId) {
      const cart = await this.cartRepository.findOne({
        where: { id: cachedCartId, status: CartStatus.ACTIVE },
      });

      if (cart) {
        // Refresh Redis TTL
        await this.safeRedisExpire(redisKey, REDIS_CART_TTL);
        return cart;
      }
    }

    // Check DB for existing active cart
    const existingCart = await this.cartRepository.findOne({
      where: { sessionId, status: CartStatus.ACTIVE },
    });

    if (existingCart) {
      // Cache in Redis and refresh expiry
      await this.safeRedisSet(redisKey, existingCart.id, REDIS_CART_TTL);
      return existingCart;
    }

    // Create new cart for guest session
    return this.createNewCart(undefined, sessionId);
  }

  /**
   * Create a brand-new cart, persist it, and cache its ID in Redis.
   */
  private async createNewCart(
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CART_EXPIRY_HOURS);

    const cart = this.cartRepository.create({
      userId: userId ?? undefined,
      sessionId: sessionId ?? undefined,
      status: CartStatus.ACTIVE,
      expiresAt,
      currency: 'USD',
    });

    const savedCart = await this.cartRepository.save(cart);

    // Cache in Redis
    if (userId) {
      await this.safeRedisSet(
        REDIS_KEY_USER_CART(userId),
        savedCart.id,
        REDIS_CART_TTL,
      );
    }

    if (sessionId) {
      await this.safeRedisSet(
        REDIS_KEY_SESSION_CART(sessionId),
        savedCart.id,
        REDIS_CART_TTL,
      );
    }

    this.logger.debug(
      `Created new cart ${savedCart.id} for userId=${userId}, sessionId=${sessionId}`,
    );

    return savedCart;
  }

  /**
   * Find an active cart by userId or sessionId without creating one.
   */
  private async findActiveCart(
    userId?: string,
    sessionId?: string,
  ): Promise<Cart | null> {
    if (userId) {
      return this.cartRepository.findOne({
        where: { userId, status: CartStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    }

    if (sessionId) {
      return this.cartRepository.findOne({
        where: { sessionId, status: CartStatus.ACTIVE },
      });
    }

    return null;
  }

  /**
   * Invalidate the Redis cache for a cart (by userId and/or sessionId).
   */
  private async invalidateCartCache(
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    const keysToDelete: string[] = [];

    if (userId) {
      keysToDelete.push(REDIS_KEY_USER_CART(userId));
    }

    if (sessionId) {
      keysToDelete.push(REDIS_KEY_SESSION_CART(sessionId));
    }

    if (keysToDelete.length > 0) {
      try {
        await this.redisService.del(...keysToDelete);
        this.logger.debug(
          `Invalidated cart cache keys: ${keysToDelete.join(', ')}`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to invalidate cart cache: ${(error as Error).message}`,
        );
      }
    }
  }

  // ──────────────────────────────────────────────
  //  Redis safety wrappers (non-throwing)
  // ──────────────────────────────────────────────

  private async safeRedisGet(key: string): Promise<string | null> {
    try {
      return await this.redisService.get(key);
    } catch (error) {
      this.logger.warn(
        `Redis GET failed for ${key}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async safeRedisSet(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    try {
      await this.redisService.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Redis SET failed for ${key}: ${(error as Error).message}`,
      );
    }
  }

  private async safeRedisExpire(key: string, ttl: number): Promise<void> {
    try {
      await this.redisService.expire(key, ttl);
    } catch (error) {
      this.logger.warn(
        `Redis EXPIRE failed for ${key}: ${(error as Error).message}`,
      );
    }
  }

  private async safeRedisDelete(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis DEL failed for ${key}: ${(error as Error).message}`,
      );
    }
  }
}
