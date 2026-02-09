import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { DownloadLink, DownloadLinkStatus } from '../../entities/download-link.entity';
import { DownloadLog } from '../../entities/download-log.entity';
import { License, LicenseType, LicenseStatus } from '../../entities/license.entity';
import { LicenseActivation } from '../../entities/license-activation.entity';
import { ProductUpdate } from '../../entities/product-update.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class DeliveryRepository {
  constructor(
    @InjectRepository(DownloadLink)
    private readonly downloadLinkRepository: Repository<DownloadLink>,
    @InjectRepository(DownloadLog)
    private readonly downloadLogRepository: Repository<DownloadLog>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(LicenseActivation)
    private readonly licenseActivationRepository: Repository<LicenseActivation>,
    @InjectRepository(ProductUpdate)
    private readonly productUpdateRepository: Repository<ProductUpdate>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    @InjectRepository(DigitalProductFile)
    private readonly digitalProductFileRepository: Repository<DigitalProductFile>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // ──────────────────────────────────────────────
  //  Cursor helpers
  // ──────────────────────────────────────────────

  private encodeCursor(date: Date, id: string): string {
    return Buffer.from(`${date.toISOString()}|${id}`).toString('base64');
  }

  private decodeCursor(cursor: string): { date: Date; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const [dateStr, id] = decoded.split('|');
      return { date: new Date(dateStr), id };
    } catch {
      return { date: new Date(), id: '' };
    }
  }

  // ──────────────────────────────────────────────
  //  Download Link methods
  // ──────────────────────────────────────────────

  async createDownloadLink(data: Partial<DownloadLink>): Promise<DownloadLink> {
    const token = uuidv4();
    const shortCode = crypto.randomBytes(4).toString('hex'); // 8 hex chars

    const link = this.downloadLinkRepository.create({
      ...data,
      token,
      shortCode,
      status: DownloadLinkStatus.ACTIVE,
      downloadCount: 0,
    });

    return this.downloadLinkRepository.save(link);
  }

  async findDownloadLinkByToken(token: string): Promise<DownloadLink | null> {
    return this.downloadLinkRepository.findOne({
      where: { token },
      relations: ['digitalProduct', 'order', 'user', 'downloadLogs'],
    });
  }

  async findDownloadLinkByShortCode(shortCode: string): Promise<DownloadLink | null> {
    return this.downloadLinkRepository.findOne({
      where: { shortCode },
      relations: ['digitalProduct', 'order', 'user'],
    });
  }

  async findDownloadLinksByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<DownloadLink>> {
    const qb = this.downloadLinkRepository
      .createQueryBuilder('link')
      .leftJoinAndSelect('link.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('link.order', 'order')
      .where('link.userId = :userId', { userId });

    if (cursor) {
      const { date, id } = this.decodeCursor(cursor);
      qb.andWhere(
        '(link.createdAt < :cursorDate OR (link.createdAt = :cursorDate AND link.id < :cursorId))',
        { cursorDate: date, cursorId: id },
      );
    }

    qb.orderBy('link.createdAt', 'DESC').addOrderBy('link.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
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

  async findDownloadLinksByOrder(orderId: string): Promise<DownloadLink[]> {
    return this.downloadLinkRepository.find({
      where: { orderId },
      relations: ['digitalProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateDownloadLink(id: string, data: Partial<DownloadLink>): Promise<DownloadLink | null> {
    await this.downloadLinkRepository.update(id, data);
    return this.downloadLinkRepository.findOne({
      where: { id },
      relations: ['digitalProduct', 'order', 'user'],
    });
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.downloadLinkRepository
      .createQueryBuilder()
      .update(DownloadLink)
      .set({
        downloadCount: () => 'download_count + 1',
        lastDownloadedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  async expireOldLinks(): Promise<number> {
    const result = await this.downloadLinkRepository
      .createQueryBuilder()
      .update(DownloadLink)
      .set({ status: DownloadLinkStatus.EXPIRED })
      .where('status = :status', { status: DownloadLinkStatus.ACTIVE })
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected ?? 0;
  }

  // ──────────────────────────────────────────────
  //  Download Log methods
  // ──────────────────────────────────────────────

  async createDownloadLog(data: Partial<DownloadLog>): Promise<DownloadLog> {
    const log = this.downloadLogRepository.create(data);
    return this.downloadLogRepository.save(log);
  }

  async findLogsByLink(downloadLinkId: string): Promise<DownloadLog[]> {
    return this.downloadLogRepository.find({
      where: { downloadLinkId },
      order: { downloadedAt: 'DESC' },
    });
  }

  async findLogsByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<DownloadLog>> {
    const qb = this.downloadLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.downloadLink', 'downloadLink')
      .where('log.userId = :userId', { userId });

    if (cursor) {
      const { date, id } = this.decodeCursor(cursor);
      qb.andWhere(
        '(log.downloadedAt < :cursorDate OR (log.downloadedAt = :cursorDate AND log.id < :cursorId))',
        { cursorDate: date, cursorId: id },
      );
    }

    qb.orderBy('log.downloadedAt', 'DESC').addOrderBy('log.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor(items[items.length - 1].downloadedAt, items[items.length - 1].id)
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

  async getDownloadStats(): Promise<{
    totalDownloads: number;
    downloadsByProduct: { digitalProductId: string; productTitle: string; count: number }[];
    downloadsByCountry: { country: string; count: number }[];
    totalBandwidth: number;
  }> {
    const totalDownloads = await this.downloadLogRepository.count();

    const downloadsByProduct = await this.downloadLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.downloadLink', 'link')
      .leftJoin('link.digitalProduct', 'product')
      .select('link.digital_product_id', 'digitalProductId')
      .addSelect('product.title', 'productTitle')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('link.digital_product_id')
      .addGroupBy('product.title')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    const downloadsByCountry = await this.downloadLogRepository
      .createQueryBuilder('log')
      .select('log.country', 'country')
      .addSelect('COUNT(log.id)', 'count')
      .where('log.country IS NOT NULL')
      .groupBy('log.country')
      .orderBy('count', 'DESC')
      .getRawMany();

    const bandwidthResult = await this.downloadLogRepository
      .createQueryBuilder('log')
      .select('COALESCE(SUM(log.bytes_transferred), 0)', 'totalBandwidth')
      .getRawOne();

    return {
      totalDownloads,
      downloadsByProduct: downloadsByProduct.map((r) => ({
        digitalProductId: r.digitalProductId,
        productTitle: r.productTitle,
        count: parseInt(r.count, 10),
      })),
      downloadsByCountry: downloadsByCountry.map((r) => ({
        country: r.country,
        count: parseInt(r.count, 10),
      })),
      totalBandwidth: parseInt(bandwidthResult?.totalBandwidth ?? '0', 10),
    };
  }

  async getRecentDownloadsByIp(ipAddress: string, minutes: number): Promise<DownloadLog[]> {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    return this.downloadLogRepository
      .createQueryBuilder('log')
      .where('log.ipAddress = :ipAddress', { ipAddress })
      .andWhere('log.downloadedAt > :since', { since })
      .orderBy('log.downloadedAt', 'DESC')
      .getMany();
  }

  async getDistinctCountriesByUser(userId: string, hours: number): Promise<string[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const results = await this.downloadLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.country', 'country')
      .where('log.userId = :userId', { userId })
      .andWhere('log.downloadedAt > :since', { since })
      .andWhere('log.country IS NOT NULL')
      .getRawMany();

    return results.map((r) => r.country);
  }

  // ──────────────────────────────────────────────
  //  License methods
  // ──────────────────────────────────────────────

  async createLicense(data: Partial<License>): Promise<License> {
    // Generate license key in XXXX-XXXX-XXXX-XXXX format
    const segments: string[] = [];
    for (let i = 0; i < 4; i++) {
      segments.push(
        crypto
          .randomBytes(2)
          .toString('hex')
          .toUpperCase(),
      );
    }
    const licenseKey = segments.join('-');

    const license = this.licenseRepository.create({
      ...data,
      licenseKey,
    });

    return this.licenseRepository.save(license);
  }

  async findLicenseByKey(licenseKey: string): Promise<License | null> {
    return this.licenseRepository.findOne({
      where: { licenseKey },
      relations: ['digitalProduct', 'activations', 'user', 'order'],
    });
  }

  async findLicensesByUser(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<PaginatedResponse<License>> {
    const qb = this.licenseRepository
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('license.activations', 'activations')
      .where('license.userId = :userId', { userId });

    if (cursor) {
      const { date, id } = this.decodeCursor(cursor);
      qb.andWhere(
        '(license.createdAt < :cursorDate OR (license.createdAt = :cursorDate AND license.id < :cursorId))',
        { cursorDate: date, cursorId: id },
      );
    }

    qb.orderBy('license.createdAt', 'DESC').addOrderBy('license.id', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
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

  async findLicensesByProduct(productId: string): Promise<License[]> {
    return this.licenseRepository.find({
      where: { digitalProductId: productId },
      relations: ['user', 'activations'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateLicense(id: string, data: Partial<License>): Promise<License | null> {
    await this.licenseRepository.update(id, data);
    return this.licenseRepository.findOne({
      where: { id },
      relations: ['digitalProduct', 'activations', 'user'],
    });
  }

  async findLicenseByUserAndProduct(userId: string, productId: string): Promise<License | null> {
    return this.licenseRepository.findOne({
      where: {
        userId,
        digitalProductId: productId,
      },
      relations: ['digitalProduct', 'activations'],
    });
  }

  async findLicenseById(id: string): Promise<License | null> {
    return this.licenseRepository.findOne({
      where: { id },
      relations: ['digitalProduct', 'activations', 'user', 'order'],
    });
  }

  // ──────────────────────────────────────────────
  //  License Activation methods
  // ──────────────────────────────────────────────

  async createActivation(data: Partial<LicenseActivation>): Promise<LicenseActivation> {
    const activation = this.licenseActivationRepository.create(data);
    return this.licenseActivationRepository.save(activation);
  }

  async findActiveActivations(licenseId: string): Promise<LicenseActivation[]> {
    return this.licenseActivationRepository.find({
      where: { licenseId, isActive: true },
      order: { activatedAt: 'DESC' },
    });
  }

  async deactivateActivation(id: string): Promise<void> {
    await this.licenseActivationRepository.update(id, {
      isActive: false,
      deactivatedAt: new Date(),
    });
  }

  async findActivationByDomain(licenseId: string, domain: string): Promise<LicenseActivation | null> {
    return this.licenseActivationRepository.findOne({
      where: { licenseId, domain, isActive: true },
    });
  }

  async findActivationById(id: string): Promise<LicenseActivation | null> {
    return this.licenseActivationRepository.findOne({
      where: { id },
      relations: ['license'],
    });
  }

  // ──────────────────────────────────────────────
  //  Product Update methods
  // ──────────────────────────────────────────────

  async createProductUpdate(data: Partial<ProductUpdate>): Promise<ProductUpdate> {
    const update = this.productUpdateRepository.create(data);
    return this.productUpdateRepository.save(update);
  }

  async findUpdatesByProduct(productId: string): Promise<ProductUpdate[]> {
    return this.productUpdateRepository.find({
      where: { digitalProductId: productId },
      relations: ['digitalProduct'],
      order: { publishedAt: 'DESC' },
    });
  }

  async findLatestUpdate(productId: string): Promise<ProductUpdate | null> {
    return this.productUpdateRepository.findOne({
      where: { digitalProductId: productId },
      relations: ['digitalProduct'],
      order: { publishedAt: 'DESC' },
    });
  }

  async findPendingNotifications(): Promise<ProductUpdate[]> {
    return this.productUpdateRepository.find({
      where: { notifiedBuyers: false },
      relations: ['digitalProduct'],
      order: { publishedAt: 'ASC' },
    });
  }

  async markAsNotified(id: string): Promise<void> {
    await this.productUpdateRepository.update(id, { notifiedBuyers: true });
  }

  async getUserAvailableUpdates(userId: string): Promise<ProductUpdate[]> {
    // Find updates for products the user has purchased (through completed orders)
    return this.productUpdateRepository
      .createQueryBuilder('update')
      .innerJoin('order_items', 'oi', 'oi.digital_product_id = update.digital_product_id')
      .innerJoin('orders', 'o', 'o.id = oi.order_id')
      .leftJoinAndSelect('update.digitalProduct', 'product')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('update.published_at IS NOT NULL')
      .andWhere('update.published_at > o.completed_at')
      .orderBy('update.published_at', 'DESC')
      .getMany();
  }

  // ──────────────────────────────────────────────
  //  Helper methods
  // ──────────────────────────────────────────────

  async findOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }

  async findOrderItemById(orderItemId: string): Promise<OrderItem | null> {
    return this.orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: ['digitalProduct', 'order'],
    });
  }

  async findDigitalProductById(productId: string): Promise<DigitalProduct | null> {
    return this.digitalProductRepository.findOne({
      where: { id: productId },
      relations: ['files'],
    });
  }

  async findDigitalProductFilesByProductId(productId: string): Promise<DigitalProductFile[]> {
    return this.digitalProductFileRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });
  }

  async findUserCompletedOrdersWithProducts(userId: string): Promise<OrderItem[]> {
    return this.orderItemRepository
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'order')
      .leftJoinAndSelect('oi.digitalProduct', 'product')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .orderBy('order.completedAt', 'DESC')
      .getMany();
  }
}
