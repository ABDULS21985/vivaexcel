import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DeliveryRepository } from '../delivery.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { DownloadLink, DownloadLinkStatus } from '../../../entities/download-link.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// Cache constants
const CACHE_TTL_DOWNLOADS = 300; // 5 minutes
const CACHE_TAG = 'delivery-downloads';

// Rate limiting constants
const RATE_LIMIT_MAX_DOWNLOADS = 10;
const RATE_LIMIT_WINDOW_MINUTES = 60;
const GEO_ANOMALY_MAX_COUNTRIES = 5;
const GEO_ANOMALY_WINDOW_HOURS = 1;

// Download link defaults
const DEFAULT_MAX_DOWNLOADS = 5;
const DEFAULT_EXPIRY_HOURS = 72; // 3 days

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  constructor(
    private readonly repository: DeliveryRepository,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Generate download link for completed order
  // ──────────────────────────────────────────────

  async generateDownloadLink(
    orderId: string,
    orderItemId: string,
    userId: string,
    digitalProductId: string,
    variantId?: string,
  ): Promise<ApiResponse<DownloadLink>> {
    this.logger.log(
      `Generating download link for order ${orderId}, item ${orderItemId}, user ${userId}`,
    );

    // Verify the order exists and belongs to the user
    const order = await this.repository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Verify the order item exists and belongs to the order
    const orderItem = await this.repository.findOrderItemById(orderItemId);
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID "${orderItemId}" not found`);
    }
    if (orderItem.orderId !== orderId) {
      throw new BadRequestException('Order item does not belong to the specified order');
    }

    // Verify the digital product exists
    const product = await this.repository.findDigitalProductById(digitalProductId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${digitalProductId}" not found`);
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DEFAULT_EXPIRY_HOURS);

    const link = await this.repository.createDownloadLink({
      orderId,
      orderItemId,
      userId,
      digitalProductId,
      variantId,
      maxDownloads: DEFAULT_MAX_DOWNLOADS,
      expiresAt,
    });

    // Invalidate user downloads cache
    await this.cacheService.invalidateByTag(`${CACHE_TAG}:user:${userId}`);
    this.logger.log(`Download link generated: ${link.id} (token: ${link.token})`);

    return {
      status: 'success',
      message: 'Download link generated successfully',
      data: link,
    };
  }

  // ──────────────────────────────────────────────
  //  Process download - the main download flow
  // ──────────────────────────────────────────────

  async processDownload(
    token: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ redirectUrl: string }> {
    this.logger.log(`Processing download for token: ${token}, user: ${userId}, IP: ${ipAddress}`);

    // a) Validate token exists and status is ACTIVE
    const link = await this.repository.findDownloadLinkByToken(token);
    if (!link) {
      throw new NotFoundException('Download link not found or invalid token');
    }

    if (link.status === DownloadLinkStatus.REVOKED) {
      throw new ForbiddenException('This download link has been revoked');
    }

    // b) Check if expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      if (link.status !== DownloadLinkStatus.EXPIRED) {
        await this.repository.updateDownloadLink(link.id, {
          status: DownloadLinkStatus.EXPIRED,
        });
      }
      throw new BadRequestException(
        'This download link has expired. Please request a new download link.',
      );
    }

    // c) Check downloadCount < maxDownloads
    if (link.downloadCount >= link.maxDownloads) {
      if (link.status !== DownloadLinkStatus.EXHAUSTED) {
        await this.repository.updateDownloadLink(link.id, {
          status: DownloadLinkStatus.EXHAUSTED,
        });
      }
      throw new BadRequestException(
        'Download limit reached. Please request a new download link.',
      );
    }

    if (link.status !== DownloadLinkStatus.ACTIVE) {
      throw new BadRequestException(`Download link is not active. Current status: ${link.status}`);
    }

    // d) Verify userId matches (for authenticated downloads)
    if (userId && link.userId !== userId) {
      this.logger.warn(
        `User mismatch for download link ${link.id}: expected ${link.userId}, got ${userId}`,
      );
      throw new ForbiddenException('You do not have permission to use this download link');
    }

    // e) Check rate limit (max 10 downloads per IP per hour)
    const rateLimited = await this.checkRateLimit(ipAddress);
    if (rateLimited) {
      this.logger.warn(`Rate limit exceeded for IP: ${ipAddress}`);
      throw new BadRequestException(
        'Too many download requests. Please try again later.',
      );
    }

    // f) Check geographic anomaly
    if (userId) {
      const geoAnomaly = await this.checkGeographicAnomaly(userId);
      if (geoAnomaly) {
        this.logger.warn(
          `Geographic anomaly detected for user: ${userId} — downloads from too many countries`,
        );
        // We log but still allow the download; admin can review suspicious patterns
      }
    }

    // g) Get file from digital product, generate file URL
    const files = await this.repository.findDigitalProductFilesByProductId(
      link.digitalProductId,
    );

    let targetFile = files[0]; // Default to first file
    if (link.variantId) {
      const variantFile = files.find((f) => f.variantId === link.variantId);
      if (variantFile) {
        targetFile = variantFile;
      }
    }

    if (!targetFile) {
      throw new NotFoundException('No downloadable file found for this product');
    }

    // Placeholder: In production, generate a pre-signed URL from your storage provider (S3, etc.)
    const redirectUrl = targetFile.fileKey;

    // h) Log download
    await this.repository.createDownloadLog({
      downloadLinkId: link.id,
      userId: link.userId,
      ipAddress,
      userAgent,
      fileId: targetFile.id,
      fileVersion: targetFile.version ?? undefined,
      bytesTransferred: targetFile.fileSize,
      completedSuccessfully: true,
      downloadedAt: new Date(),
    });

    // i) Increment downloadCount
    await this.repository.incrementDownloadCount(link.id);

    // Check if downloads are now exhausted after this download
    if (link.downloadCount + 1 >= link.maxDownloads) {
      await this.repository.updateDownloadLink(link.id, {
        status: DownloadLinkStatus.EXHAUSTED,
      });
    }

    this.logger.log(
      `Download processed successfully for link ${link.id}: file ${targetFile.fileName}`,
    );

    // j) Return redirect URL
    return { redirectUrl };
  }

  // ──────────────────────────────────────────────
  //  Get user's purchased products with download links
  // ──────────────────────────────────────────────

  async getUserDownloads(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const cacheKey = this.cacheService.generateKey('delivery', 'downloads', userId, cursor ?? 'initial', limit);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findDownloadLinksByUser(userId, cursor, limit),
      { ttl: CACHE_TTL_DOWNLOADS, tags: [CACHE_TAG, `${CACHE_TAG}:user:${userId}`] },
    );

    return {
      status: 'success',
      message: 'User downloads retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  // ──────────────────────────────────────────────
  //  Refresh expired download link
  // ──────────────────────────────────────────────

  async refreshDownloadLink(
    downloadLinkId: string,
    userId: string,
  ): Promise<ApiResponse<DownloadLink>> {
    this.logger.log(`Refreshing download link: ${downloadLinkId} for user: ${userId}`);

    const link = await this.repository.findDownloadLinkByToken(downloadLinkId);

    // Also try finding by ID if token-based lookup fails
    let existingLink = link;
    if (!existingLink) {
      const qbLink = await this.repository.updateDownloadLink(downloadLinkId, {});
      existingLink = qbLink;
    }

    if (!existingLink) {
      throw new NotFoundException(`Download link with ID "${downloadLinkId}" not found`);
    }

    if (existingLink.userId !== userId) {
      throw new ForbiddenException('You do not have permission to refresh this download link');
    }

    // Verify the original order is still valid
    const order = await this.repository.findOrderById(existingLink.orderId);
    if (!order) {
      throw new NotFoundException('Original order not found');
    }
    if (order.status === 'refunded') {
      throw new BadRequestException('Cannot refresh download link for a refunded order');
    }

    // Refresh the link: reset download count, new expiry, set status to ACTIVE
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + DEFAULT_EXPIRY_HOURS);

    const refreshedLink = await this.repository.updateDownloadLink(existingLink.id, {
      status: DownloadLinkStatus.ACTIVE,
      downloadCount: 0,
      expiresAt: newExpiresAt,
    });

    if (!refreshedLink) {
      throw new NotFoundException('Failed to refresh download link');
    }

    // Invalidate cache
    await this.cacheService.invalidateByTag(`${CACHE_TAG}:user:${userId}`);
    this.logger.log(`Download link refreshed: ${existingLink.id}`);

    return {
      status: 'success',
      message: 'Download link refreshed successfully',
      data: refreshedLink,
    };
  }

  // ──────────────────────────────────────────────
  //  Download analytics (admin)
  // ──────────────────────────────────────────────

  async getDownloadAnalytics(): Promise<ApiResponse<any>> {
    const cacheKey = this.cacheService.generateKey('delivery', 'analytics');

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.getDownloadStats(),
      { ttl: CACHE_TTL_DOWNLOADS, tags: [CACHE_TAG, `${CACHE_TAG}:analytics`] },
    );

    return {
      status: 'success',
      message: 'Download analytics retrieved successfully',
      data: stats,
    };
  }

  // ──────────────────────────────────────────────
  //  Suspicious download patterns (admin)
  // ──────────────────────────────────────────────

  async getSuspiciousDownloads(): Promise<ApiResponse<any>> {
    this.logger.log('Fetching suspicious download patterns');

    // Find IPs with excessive downloads in the last hour
    const cacheKey = this.cacheService.generateKey('delivery', 'suspicious');

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        // Get download logs from last 24 hours grouped by IP
        const recentLogs = await this.repository.getRecentDownloadsByIp('*', 1440); // Not practical for all IPs

        // Instead use raw query approach: find IPs with many downloads
        // This is a simplified detection; in production, use more sophisticated anomaly detection
        return {
          message:
            'Suspicious download detection is based on rate limiting and geographic anomaly flags. Review download logs for patterns.',
          note: 'Check download_logs table for IPs with excessive download counts or users with downloads from many countries.',
        };
      },
      { ttl: 60, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Suspicious download patterns retrieved',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Expire old links (cron or manual)
  // ──────────────────────────────────────────────

  async expireOldLinks(): Promise<void> {
    const count = await this.repository.expireOldLinks();
    this.logger.log(`Expired ${count} old download links`);

    if (count > 0) {
      await this.cacheService.invalidateByTag(CACHE_TAG);
    }
  }

  // ──────────────────────────────────────────────
  //  Rate limiting helper using Redis
  // ──────────────────────────────────────────────

  private async checkRateLimit(ipAddress: string): Promise<boolean> {
    try {
      const key = `rate-limit:download:${ipAddress}`;
      const cached = await this.cacheService.get<number>(key);
      const currentCount = cached ?? 0;

      if (currentCount >= RATE_LIMIT_MAX_DOWNLOADS) {
        return true; // Rate limited
      }

      // Increment the counter
      await this.cacheService.set(key, currentCount + 1, RATE_LIMIT_WINDOW_MINUTES * 60);

      return false;
    } catch (error) {
      this.logger.warn(`Rate limit check failed for IP ${ipAddress}: ${(error as Error).message}`);
      // On failure, allow the download (fail open)
      return false;
    }
  }

  // ──────────────────────────────────────────────
  //  Geographic anomaly detection
  // ──────────────────────────────────────────────

  private async checkGeographicAnomaly(userId: string): Promise<boolean> {
    try {
      const countries = await this.repository.getDistinctCountriesByUser(
        userId,
        GEO_ANOMALY_WINDOW_HOURS,
      );

      if (countries.length > GEO_ANOMALY_MAX_COUNTRIES) {
        this.logger.warn(
          `Geographic anomaly: User ${userId} has downloads from ${countries.length} countries in the last ${GEO_ANOMALY_WINDOW_HOURS}h: ${countries.join(', ')}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.warn(
        `Geographic anomaly check failed for user ${userId}: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
