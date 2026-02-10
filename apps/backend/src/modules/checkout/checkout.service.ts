import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  GoneException,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';

import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DownloadToken } from '../../entities/download-token.entity';
import { Cart } from '../../entities/cart.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { User } from '../../entities/user.entity';

import { StripeService } from '../stripe/stripe.service';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../email/email.service';
import {
  StorageStrategy,
  STORAGE_STRATEGY,
} from '../media/strategies/storage.interface';
import { CacheService } from '../../common/cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AffiliateService } from '../affiliates/services/affiliate.service';
import { ReferralsService } from '../referrals/referrals.service';

import { OrderQueryDto } from './dto/order-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(DownloadToken)
    private readonly downloadTokenRepository: Repository<DownloadToken>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductVariant)
    private readonly variantRepository: Repository<DigitalProductVariant>,
    @InjectRepository(DigitalProductFile)
    private readonly fileRepository: Repository<DigitalProductFile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
    @Inject(STORAGE_STRATEGY)
    private readonly storageStrategy: StorageStrategy,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => AffiliateService))
    private readonly affiliateService: AffiliateService,
    @Inject(forwardRef(() => ReferralsService))
    private readonly referralsService: ReferralsService,
  ) {}

  // ─── Order Number Generation ────────────────────────────────────────

  /**
   * Generate a unique order number in format ORD-YYYYMMDD-XXXXXX
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const suffix = nanoid(6).toUpperCase();
    return `ORD-${year}${month}${day}-${suffix}`;
  }

  // ─── Checkout Session ───────────────────────────────────────────────

  /**
   * Create a Stripe Checkout Session for the user's cart
   */
  async createCheckoutSession(
    userId: string,
    successUrl: string,
    cancelUrl: string,
    couponCode?: string,
    affiliateSessionId?: string,
  ): Promise<{ sessionId: string; url: string }> {
    // Fetch the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get the user's active cart with items and product relations
    const cartWithSummary = await this.cartService.getCartWithItems(userId);
    const cart = cartWithSummary.cart;
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException(
        'Your cart is empty. Add items before checking out.',
      );
    }

    // Ensure user has a Stripe customer ID
    const stripeCustomerId = await this.stripeService.ensureCustomer(user);

    // Build Stripe line items from cart items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => {
        const unitPrice = Number(item.unitPrice);
        const productName =
          item.digitalProduct?.title || 'Digital Product';
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

    // Build session metadata
    const cartItemIds = cart.items.map((item) => item.id);
    const metadata: Record<string, string> = {
      type: 'digital_product_purchase',
      userId,
      cartId: cart.id,
      orderItems: JSON.stringify(cartItemIds),
    };

    if (couponCode) {
      metadata.couponCode = couponCode;
    }

    if (affiliateSessionId) {
      metadata.affiliateSessionId = affiliateSessionId;
    }

    try {
      const stripe = this.stripeService.getStripeClient();
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        customer: stripeCustomerId,
        line_items: lineItems,
        metadata,
        success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        payment_intent_data: {
          metadata: {
            type: 'digital_product_purchase',
            userId,
            cartId: cart.id,
          },
        },
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      this.logger.log(
        `Checkout session created: ${session.id} for user ${userId}, cart ${cart.id}`,
      );

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to create checkout session. Please try again.',
      );
    }
  }

  // ─── Webhook Handlers ───────────────────────────────────────────────

  /**
   * Handle checkout.session.completed for digital product purchases.
   * Called from StripeService when metadata.type === 'digital_product_purchase'.
   */
  async handleCheckoutComplete(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;

    if (!userId || !cartId) {
      this.logger.warn(
        `Checkout session ${session.id} missing userId or cartId in metadata`,
      );
      return;
    }

    // Prevent duplicate order creation -- check if order already exists for this session
    const existingOrder = await this.orderRepository.findOne({
      where: { stripeSessionId: session.id },
    });
    if (existingOrder) {
      this.logger.warn(
        `Order already exists for session ${session.id}: ${existingOrder.orderNumber}`,
      );
      return;
    }

    // Get the cart with items and product details
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      this.logger.error(`Cart ${cartId} not found or empty for session ${session.id}`);
      return;
    }

    // Fetch full product details for each cart item
    const cartItemsWithProducts = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['digitalProduct', 'variant'],
    });

    if (cartItemsWithProducts.length === 0) {
      this.logger.error(`No cart items found for cart ${cartId}`);
      return;
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItemsWithProducts) {
      subtotal += Number(item.unitPrice) * (item.quantity || 1);
    }
    const discountAmount = 0; // Coupon logic can be extended here
    const total = subtotal - discountAmount;

    const billingEmail =
      session.customer_details?.email ||
      (session as any).customer_email ||
      '';
    const billingName = session.customer_details?.name || undefined;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as any)?.id || null;

    // Use a transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order
      const order = queryRunner.manager.create(Order, {
        userId,
        orderNumber: this.generateOrderNumber(),
        status: OrderStatus.COMPLETED,
        subtotal,
        discountAmount,
        total,
        currency: cart.currency || 'USD',
        stripePaymentIntentId: paymentIntentId,
        stripeSessionId: session.id,
        billingEmail,
        billingName,
        completedAt: new Date(),
        metadata: {
          stripeSessionMode: session.mode,
          cartId,
        },
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items and download tokens
      const downloadTokensToCreate: Partial<DownloadToken>[] = [];
      const productIdsToIncrementDownloads: string[] = [];

      for (const cartItem of cartItemsWithProducts) {
        const product = cartItem.digitalProduct;
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          digitalProductId: cartItem.digitalProductId,
          variantId: cartItem.variantId || undefined,
          productTitle: product?.title || 'Digital Product',
          productSlug: product?.slug || 'unknown',
          price: Number(cartItem.unitPrice),
          currency: cartItem.currency || 'USD',
        });

        const savedOrderItem = await queryRunner.manager.save(
          OrderItem,
          orderItem,
        );

        // Create download token for this order item
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

        downloadTokensToCreate.push({
          orderItemId: savedOrderItem.id,
          userId,
          token: nanoid(32),
          expiresAt,
          downloadCount: 0,
          maxDownloads: 5,
          isActive: true,
        });

        // Track product IDs for download count increment
        if (cartItem.digitalProductId) {
          productIdsToIncrementDownloads.push(cartItem.digitalProductId);
        }
      }

      // Bulk save download tokens
      if (downloadTokensToCreate.length > 0) {
        const tokens = downloadTokensToCreate.map((t) =>
          queryRunner.manager.create(DownloadToken, t),
        );
        await queryRunner.manager.save(DownloadToken, tokens);
      }

      // Increment download counts on products
      for (const productId of productIdsToIncrementDownloads) {
        await queryRunner.manager.increment(
          DigitalProduct,
          { id: productId },
          'downloadCount',
          1,
        );
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Order ${savedOrder.orderNumber} created for user ${userId}, session ${session.id}`,
      );

      // Post-transaction: mark cart as converted and send email
      try {
        await this.cartService.markCartConverted(cartId);
      } catch (error) {
        this.logger.warn(
          `Failed to mark cart ${cartId} as converted: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Send order confirmation email
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (user) {
          const itemNames = cartItemsWithProducts
            .map((item) => item.digitalProduct?.title || 'Digital Product')
            .join(', ');

          await this.emailService.sendNotification(
            billingEmail || user.email,
            `Order Confirmed - ${savedOrder.orderNumber}`,
            `
              <h2>Thank you for your purchase!</h2>
              <p>Hi ${billingName || user.name || 'there'},</p>
              <p>Your order <strong>${savedOrder.orderNumber}</strong> has been confirmed.</p>
              <h3>Order Summary</h3>
              <p><strong>Items:</strong> ${itemNames}</p>
              <p><strong>Total:</strong> $${total.toFixed(2)} ${savedOrder.currency}</p>
              <p>You can access your downloads from your orders page. Each download link is valid for 30 days with up to 5 downloads.</p>
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            `,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send order confirmation email for ${savedOrder.orderNumber}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Invalidate relevant caches
      try {
        await this.cacheService.invalidateByTag(`user_orders:${userId}`);
        await this.cacheService.invalidateByTag('admin_orders');
      } catch {
        // Cache invalidation failure is non-critical
      }

      // Emit gamification events
      this.eventEmitter.emit('order.completed', {
        userId,
        orderId: savedOrder.id,
        total: Number(total),
      });

      for (const cartItem of cartItemsWithProducts) {
        if (cartItem.digitalProduct?.createdBy) {
          this.eventEmitter.emit('seller.sale_made', {
            sellerId: cartItem.digitalProduct.createdBy,
            orderId: savedOrder.id,
            amount: Number(cartItem.unitPrice),
          });
        }
      }

      // Post-transaction: Create affiliate commissions if applicable
      try {
        const affiliateSessionId = session.metadata?.affiliateSessionId;
        if (affiliateSessionId) {
          const orderItemsForAffiliate = cartItemsWithProducts.map((ci) => ({
            id: ci.id,
            digitalProductId: ci.digitalProductId,
            price: Number(ci.unitPrice),
            currency: ci.currency || 'USD',
          }));
          await this.affiliateService.createCommissionsForOrder(
            savedOrder,
            orderItemsForAffiliate,
            affiliateSessionId,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Failed to create affiliate commissions for order ${savedOrder.orderNumber}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Post-transaction: Qualify referral if applicable
      try {
        await this.referralsService.qualifyReferral(userId, savedOrder.id);
      } catch (error) {
        this.logger.warn(
          `Failed to qualify referral for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to create order for session ${session.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Handle checkout.session.async_payment_failed or expired events
   */
  async handlePaymentFailed(session: Stripe.Checkout.Session): Promise<void> {
    const sessionId = session.id;
    this.logger.warn(`Payment failed for checkout session: ${sessionId}`);

    // If we already created a pending order for this session, mark it as failed
    const order = await this.orderRepository.findOne({
      where: { stripeSessionId: sessionId },
    });

    if (order && order.status !== OrderStatus.COMPLETED) {
      await this.orderRepository.update(order.id, {
        status: OrderStatus.FAILED,
      });
      this.logger.log(
        `Order ${order.orderNumber} marked as FAILED due to payment failure`,
      );
    }
  }

  /**
   * Handle charge.refunded webhook event for digital product purchases
   */
  async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : (charge.payment_intent as any)?.id;

    if (!paymentIntentId) {
      this.logger.warn('Charge refunded event missing payment_intent ID');
      return;
    }

    const order = await this.orderRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
      relations: ['items'],
    });

    if (!order) {
      this.logger.warn(
        `No order found for payment intent ${paymentIntentId} on refund`,
      );
      return;
    }

    // Update order status
    await this.orderRepository.update(order.id, {
      status: OrderStatus.REFUNDED,
    });

    // Deactivate all download tokens for this order's items
    if (order.items && order.items.length > 0) {
      const orderItemIds = order.items.map((item) => item.id);
      await this.downloadTokenRepository
        .createQueryBuilder()
        .update(DownloadToken)
        .set({ isActive: false })
        .where('order_item_id IN (:...orderItemIds)', { orderItemIds })
        .execute();
    }

    this.logger.log(
      `Order ${order.orderNumber} refunded, download tokens deactivated`,
    );

    // Reverse affiliate commissions
    try {
      await this.affiliateService.reverseCommissionsForOrder(order.id);
    } catch (error) {
      this.logger.warn(
        `Failed to reverse affiliate commissions for order ${order.orderNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Invalidate caches
    try {
      await this.cacheService.invalidateByTag(
        `user_orders:${order.userId}`,
      );
      await this.cacheService.invalidateByTag('admin_orders');
    } catch {
      // Non-critical
    }
  }

  // ─── Order Verification ─────────────────────────────────────────────

  /**
   * Verify a checkout session and return the associated order
   */
  async verifyCheckoutSession(sessionId: string): Promise<Order> {
    // First, try to find the order by Stripe session ID
    const order = await this.orderRepository.findOne({
      where: { stripeSessionId: sessionId },
      relations: ['items', 'items.downloadTokens', 'items.digitalProduct'],
    });

    if (!order) {
      throw new NotFoundException(
        'Order not found for this checkout session. It may still be processing.',
      );
    }

    return order;
  }

  // ─── User Orders ───────────────────────────────────────────────────

  /**
   * Get paginated orders for a specific user (cursor-based)
   */
  async getUserOrders(
    userId: string,
    query: OrderQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const { cursor, limit = 20, status, search } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.digitalProduct', 'digitalProduct')
      .where('order.userId = :userId', { userId });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(order.orderNumber ILIKE :search OR order.billingEmail ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Cursor-based pagination
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('order.createdAt < :cursorValue', {
          cursorValue: decoded.value,
        });
      }
    }

    qb.orderBy('order.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor({
            value: items[items.length - 1].createdAt.toISOString(),
          })
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

  /**
   * Get a single order by ID for a specific user
   */
  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: [
        'items',
        'items.digitalProduct',
        'items.downloadTokens',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ─── Download ───────────────────────────────────────────────────────

  /**
   * Validate a download token and return file info for download
   */
  async getDownloadByToken(
    token: string,
    ipAddress: string,
  ): Promise<{
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }> {
    const downloadToken = await this.downloadTokenRepository.findOne({
      where: { token, isActive: true },
      relations: ['orderItem'],
    });

    if (!downloadToken) {
      throw new NotFoundException('Invalid or expired download token');
    }

    // Check expiry
    if (downloadToken.expiresAt < new Date()) {
      throw new GoneException('Download link has expired');
    }

    // Check download count
    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      throw new ForbiddenException(
        `Download limit reached (${downloadToken.maxDownloads} downloads maximum)`,
      );
    }

    const orderItem = downloadToken.orderItem;
    if (!orderItem) {
      throw new NotFoundException('Associated order item not found');
    }

    // Find the file for this product (and variant if applicable)
    const fileWhere: Record<string, any> = {
      productId: orderItem.digitalProductId,
    };
    if (orderItem.variantId) {
      fileWhere.variantId = orderItem.variantId;
    }

    let file = await this.fileRepository.findOne({ where: fileWhere });

    // If no variant-specific file found, try the base product file (no variant)
    if (!file && orderItem.variantId) {
      file = await this.fileRepository.findOne({
        where: { productId: orderItem.digitalProductId, variantId: IsNull() },
      });
      // Fallback: find any file for the product
      if (!file) {
        file = await this.fileRepository.findOne({
          where: { productId: orderItem.digitalProductId },
        });
      }
    }

    if (!file) {
      throw new NotFoundException(
        'File not found for this product. Please contact support.',
      );
    }

    // Increment download count and update IP
    await this.downloadTokenRepository.update(downloadToken.id, {
      downloadCount: downloadToken.downloadCount + 1,
      ipAddress,
    });

    // Get the file URL from storage
    const url = this.storageStrategy.getUrl(file.fileKey);

    return {
      url,
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    };
  }

  // ─── Admin Methods ──────────────────────────────────────────────────

  /**
   * Get all orders (admin) with pagination
   */
  async getAllOrders(
    query: OrderQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const { cursor, limit = 20, status, search, dateFrom, dateTo } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('order.user', 'user');

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(order.orderNumber ILIKE :search OR order.billingEmail ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    // Cursor-based pagination
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('order.createdAt < :cursorValue', {
          cursorValue: decoded.value,
        });
      }
    }

    qb.orderBy('order.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor({
            value: items[items.length - 1].createdAt.toISOString(),
          })
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

  /**
   * Get a single order by ID (admin -- no userId restriction)
   */
  async getOrderByIdAdmin(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'items',
        'items.digitalProduct',
        'items.downloadTokens',
        'user',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Refund an order via Stripe and update local records
   */
  async refundOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.downloadTokens'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund an order with status "${order.status}". Only completed orders can be refunded.`,
      );
    }

    if (!order.stripePaymentIntentId) {
      throw new BadRequestException(
        'Cannot refund: no Stripe payment intent associated with this order.',
      );
    }

    // Issue the refund via Stripe
    try {
      const stripe = this.stripeService.getStripeClient();
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
    } catch (error) {
      this.logger.error(
        `Stripe refund failed for order ${order.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to process refund with payment provider. Please try again.',
      );
    }

    // Update order status
    await this.orderRepository.update(order.id, {
      status: OrderStatus.REFUNDED,
    });

    // Deactivate all download tokens for this order's items
    if (order.items && order.items.length > 0) {
      const orderItemIds = order.items.map((item) => item.id);
      await this.downloadTokenRepository
        .createQueryBuilder()
        .update(DownloadToken)
        .set({ isActive: false })
        .where('order_item_id IN (:...orderItemIds)', { orderItemIds })
        .execute();
    }

    this.logger.log(`Order ${order.orderNumber} refunded successfully`);

    // Reverse affiliate commissions
    try {
      await this.affiliateService.reverseCommissionsForOrder(order.id);
    } catch (error) {
      this.logger.warn(
        `Failed to reverse affiliate commissions for refund ${order.orderNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Invalidate caches
    try {
      await this.cacheService.invalidateByTag(
        `user_orders:${order.userId}`,
      );
      await this.cacheService.invalidateByTag('admin_orders');
    } catch {
      // Non-critical
    }

    // Return the updated order
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.digitalProduct', 'items.downloadTokens'],
    }) as Promise<Order>;
  }

  // ─── Cursor Helpers ─────────────────────────────────────────────────

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
