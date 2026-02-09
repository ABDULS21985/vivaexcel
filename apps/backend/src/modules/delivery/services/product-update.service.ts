import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DeliveryRepository } from '../delivery.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { ProductUpdate } from '../../../entities/product-update.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// Cache constants
const CACHE_TTL_UPDATES = 300; // 5 minutes
const CACHE_TTL_CHANGELOG = 600; // 10 minutes
const CACHE_TAG = 'delivery-updates';

@Injectable()
export class ProductUpdateService {
  private readonly logger = new Logger(ProductUpdateService.name);

  constructor(
    private readonly repository: DeliveryRepository,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Publish a product update
  // ──────────────────────────────────────────────

  async publishUpdate(
    productId: string,
    version: string,
    releaseNotes: string,
    fileId?: string,
    isBreaking?: boolean,
  ): Promise<ApiResponse<ProductUpdate>> {
    this.logger.log(`Publishing update v${version} for product ${productId}`);

    // Verify product exists
    const product = await this.repository.findDigitalProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    // Create ProductUpdate record
    const update = await this.repository.createProductUpdate({
      digitalProductId: productId,
      version,
      releaseNotes,
      fileId: fileId ?? undefined,
      isBreaking: isBreaking ?? false,
      publishedAt: new Date(),
      notifiedBuyers: false,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `${CACHE_TAG}:product:${productId}`,
    ]);

    this.logger.log(
      `Product update v${version} published for product ${productId} (ID: ${update.id})`,
    );

    return {
      status: 'success',
      message: 'Product update published successfully',
      data: update,
    };
  }

  // ──────────────────────────────────────────────
  //  Get user's available updates
  // ──────────────────────────────────────────────

  async getUserUpdates(userId: string): Promise<ApiResponse<any>> {
    this.logger.debug(`Fetching available updates for user: ${userId}`);

    const cacheKey = this.cacheService.generateKey('delivery', 'user-updates', userId);

    const updates = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const rawUpdates = await this.repository.getUserAvailableUpdates(userId);

        // Group updates by product
        const grouped: Record<
          string,
          { product: any; updates: ProductUpdate[] }
        > = {};

        for (const update of rawUpdates) {
          const productId = update.digitalProductId;
          if (!grouped[productId]) {
            grouped[productId] = {
              product: update.digitalProduct,
              updates: [],
            };
          }
          grouped[productId].updates.push(update);
        }

        return Object.values(grouped);
      },
      { ttl: CACHE_TTL_UPDATES, tags: [CACHE_TAG, `${CACHE_TAG}:user:${userId}`] },
    );

    return {
      status: 'success',
      message: 'User available updates retrieved successfully',
      data: updates,
    };
  }

  // ──────────────────────────────────────────────
  //  Get product changelog (public)
  // ──────────────────────────────────────────────

  async getProductChangelog(productId: string): Promise<ApiResponse<ProductUpdate[]>> {
    this.logger.debug(`Fetching changelog for product: ${productId}`);

    const cacheKey = this.cacheService.generateKey('delivery', 'changelog', productId);

    const updates = await this.cacheService.wrap(
      cacheKey,
      async () => {
        // Verify product exists
        const product = await this.repository.findDigitalProductById(productId);
        if (!product) {
          throw new NotFoundException(`Digital product with ID "${productId}" not found`);
        }

        return this.repository.findUpdatesByProduct(productId);
      },
      { ttl: CACHE_TTL_CHANGELOG, tags: [CACHE_TAG, `${CACHE_TAG}:product:${productId}`] },
    );

    return {
      status: 'success',
      message: 'Product changelog retrieved successfully',
      data: updates,
    };
  }

  // ──────────────────────────────────────────────
  //  Mark updates as notified
  // ──────────────────────────────────────────────

  async markUpdatesNotified(updateIds: string[]): Promise<void> {
    this.logger.log(`Marking ${updateIds.length} updates as notified`);

    for (const id of updateIds) {
      await this.repository.markAsNotified(id);
    }

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.log(`${updateIds.length} updates marked as notified`);
  }

  // ──────────────────────────────────────────────
  //  Get pending notification updates (for email sending)
  // ──────────────────────────────────────────────

  async getPendingNotifications(): Promise<ApiResponse<ProductUpdate[]>> {
    this.logger.debug('Fetching pending notification updates');

    const updates = await this.repository.findPendingNotifications();

    return {
      status: 'success',
      message: 'Pending notification updates retrieved successfully',
      data: updates,
    };
  }
}
