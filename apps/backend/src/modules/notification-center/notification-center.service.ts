import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Notification } from './entities/notification.entity';
import {
  NotificationPreference,
  DEFAULT_NOTIFICATION_CATEGORIES,
  NotificationCategories,
} from './entities/notification-preference.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PushSubscribeDto } from './dto/push-subscribe.dto';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  EmailDigestFrequency,
} from './enums/notification.enums';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EmailService } from '../email/email.service';
import { CacheService } from '../../common/cache/cache.service';

/** Maps NotificationType to the category key used in preferences */
const TYPE_TO_CATEGORY: Record<NotificationType, keyof NotificationCategories> = {
  [NotificationType.ORDER]: 'orders',
  [NotificationType.REVIEW]: 'reviews',
  [NotificationType.PRODUCT_UPDATE]: 'product_updates',
  [NotificationType.PROMOTION]: 'promotions',
  [NotificationType.SYSTEM]: 'security', // system messages always delivered
  [NotificationType.COMMUNITY]: 'community',
  [NotificationType.ACHIEVEMENT]: 'achievements',
  [NotificationType.PAYOUT]: 'orders', // payouts grouped with order-related
  [NotificationType.SUBSCRIPTION]: 'orders',
  [NotificationType.SECURITY]: 'security',
};

@Injectable()
export class NotificationCenterService {
  private readonly logger = new Logger(NotificationCenterService.name);
  private readonly UNREAD_COUNT_CACHE_PREFIX = 'notification:unread:';
  private readonly UNREAD_COUNT_TTL = 5; // 5 seconds

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    @InjectRepository(PushSubscription)
    private readonly pushSubscriptionRepo: Repository<PushSubscription>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.initializeWebPush();
  }

  // ──────────────────────────────────────────────
  //  Web Push initialization
  // ──────────────────────────────────────────────

  private initializeWebPush(): void {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@example.com');

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.logger.log('Web Push VAPID details configured');
    } else {
      this.logger.warn(
        'VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY not configured. Push notifications will be unavailable.',
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Send single notification
  // ──────────────────────────────────────────────

  async sendNotification(
    userId: string,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const category = TYPE_TO_CATEGORY[dto.type];
    const channel = dto.channel || NotificationChannel.IN_APP;

    // Check user preferences (skip check for SECURITY type -- always delivered)
    if (dto.type !== NotificationType.SECURITY) {
      const shouldSend = await this.shouldSendToChannel(userId, category, channel);
      if (!shouldSend) {
        this.logger.log(
          `Notification suppressed for user ${userId}: category=${category}, channel=${channel}`,
        );
        // Still create the in-app record even if the preferred channel is suppressed
        // so the user can find it later
      }
    }

    // Check quiet hours for non-urgent notifications
    if (dto.priority !== 'urgent') {
      const preference = await this.getOrCreatePreference(userId);
      if (this.isQuietHours(preference)) {
        this.logger.log(
          `Quiet hours active for user ${userId}, queuing notification for later`,
        );
        // For quiet hours, we still save the notification but skip push/email
        const notification = this.notificationRepo.create({
          userId,
          type: dto.type,
          channel: NotificationChannel.IN_APP,
          title: dto.title,
          body: dto.body,
          actionUrl: dto.actionUrl || null,
          actionLabel: dto.actionLabel || null,
          imageUrl: dto.imageUrl || null,
          priority: dto.priority || 'normal',
          status: NotificationStatus.UNREAD,
          metadata: dto.metadata || {},
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        });
        const saved = await this.notificationRepo.save(notification);
        await this.invalidateUnreadCountCache(userId);
        // Still send WebSocket so it shows up in-app
        this.notificationsGateway.notifyUser(userId, 'notification:new', saved);
        return saved;
      }
    }

    // Create and save the notification
    const notification = this.notificationRepo.create({
      userId,
      type: dto.type,
      channel,
      title: dto.title,
      body: dto.body,
      actionUrl: dto.actionUrl || null,
      actionLabel: dto.actionLabel || null,
      imageUrl: dto.imageUrl || null,
      priority: dto.priority || 'normal',
      status: NotificationStatus.UNREAD,
      metadata: dto.metadata || {},
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    const saved = await this.notificationRepo.save(notification);
    await this.invalidateUnreadCountCache(userId);

    // Dispatch to appropriate channel
    switch (channel) {
      case NotificationChannel.IN_APP:
        this.notificationsGateway.notifyUser(userId, 'notification:new', saved);
        break;

      case NotificationChannel.EMAIL:
        // Queue email (fire-and-forget)
        this.emailService
          .sendNotification(userId, dto.title, dto.body)
          .catch((err) =>
            this.logger.error(`Failed to send email notification to ${userId}`, err),
          );
        // Also send in-app via WebSocket
        this.notificationsGateway.notifyUser(userId, 'notification:new', saved);
        break;

      case NotificationChannel.PUSH:
        // Send push notification (fire-and-forget)
        this.sendPushNotification(userId, {
          title: dto.title,
          body: dto.body,
          icon: dto.imageUrl,
          data: { url: dto.actionUrl, notificationId: saved.id },
        }).catch((err) =>
          this.logger.error(`Failed to send push notification to ${userId}`, err),
        );
        // Also send in-app via WebSocket
        this.notificationsGateway.notifyUser(userId, 'notification:new', saved);
        break;

      case NotificationChannel.SMS:
        // SMS is not implemented; log and deliver in-app
        this.logger.warn('SMS notification channel not yet implemented');
        this.notificationsGateway.notifyUser(userId, 'notification:new', saved);
        break;
    }

    return saved;
  }

  // ──────────────────────────────────────────────
  //  Send bulk notifications
  // ──────────────────────────────────────────────

  async sendBulkNotification(
    userIds: string[],
    dto: CreateNotificationDto,
  ): Promise<{ sent: number; failed: number }> {
    const CHUNK_SIZE = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE);

      const results = await Promise.allSettled(
        chunk.map((userId) => this.sendNotification(userId, dto)),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          sent++;
        } else {
          failed++;
          this.logger.error(
            `Bulk notification failed for a user: ${result.reason}`,
          );
        }
      }
    }

    this.logger.log(
      `Bulk notification complete: ${sent} sent, ${failed} failed out of ${userIds.length}`,
    );
    return { sent, failed };
  }

  // ──────────────────────────────────────────────
  //  Get notifications (paginated)
  // ──────────────────────────────────────────────

  async getNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId });

    if (query.type) {
      qb.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('notification.status = :status', { status: query.status });
    }

    if (query.channel) {
      qb.andWhere('notification.channel = :channel', { channel: query.channel });
    }

    // Filter out expired notifications
    qb.andWhere(
      '(notification.expires_at IS NULL OR notification.expires_at > :now)',
      { now: new Date() },
    );

    // Map sortBy to actual column names
    const sortColumn =
      sortBy === 'createdAt'
        ? 'notification.created_at'
        : sortBy === 'priority'
          ? 'notification.priority'
          : 'notification.type';

    qb.orderBy(sortColumn, sortOrder);
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ──────────────────────────────────────────────
  //  Get grouped notifications
  // ──────────────────────────────────────────────

  async getGroupedNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    data: Array<{
      notification: Notification;
      groupCount?: number;
      groupLatest?: Notification[];
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // First get regular notifications
    const result = await this.getNotifications(userId, query);

    // Find grouped notifications
    const groupedMap = new Map<string, Notification[]>();
    const ungrouped: Notification[] = [];

    for (const notif of result.data) {
      if (notif.groupId) {
        if (!groupedMap.has(notif.groupId)) {
          groupedMap.set(notif.groupId, []);
        }
        groupedMap.get(notif.groupId)!.push(notif);
      } else {
        ungrouped.push(notif);
      }
    }

    const data: Array<{
      notification: Notification;
      groupCount?: number;
      groupLatest?: Notification[];
    }> = [];

    // Add ungrouped as-is
    for (const notif of ungrouped) {
      data.push({ notification: notif });
    }

    // For grouped, show the latest one with count
    for (const [groupId, notifications] of groupedMap) {
      const sorted = notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Get total count from DB for this group (may be more than what's on this page)
      const totalGroupCount = await this.notificationRepo.count({
        where: { userId, groupId },
      });

      data.push({
        notification: sorted[0],
        groupCount: totalGroupCount,
        groupLatest: sorted.slice(0, 3),
      });
    }

    // Sort by createdAt desc
    data.sort(
      (a, b) =>
        new Date(b.notification.createdAt).getTime() -
        new Date(a.notification.createdAt).getTime(),
    );

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  // ──────────────────────────────────────────────
  //  Mark as read
  // ──────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    const updated = await this.notificationRepo.save(notification);
    await this.invalidateUnreadCountCache(userId);

    // Notify via WebSocket so UI can update in real-time
    this.notificationsGateway.notifyUser(userId, 'notification:read', {
      id: notificationId,
    });

    return updated;
  }

  // ──────────────────────────────────────────────
  //  Mark all as read
  // ──────────────────────────────────────────────

  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('user_id = :userId', { userId })
      .andWhere('status = :status', { status: NotificationStatus.UNREAD })
      .execute();

    const affected = result.affected ?? 0;
    await this.invalidateUnreadCountCache(userId);

    this.notificationsGateway.notifyUser(userId, 'notification:all-read', {
      affected,
    });

    return { affected };
  }

  // ──────────────────────────────────────────────
  //  Get unread count (Redis-cached)
  // ──────────────────────────────────────────────

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const cacheKey = `${this.UNREAD_COUNT_CACHE_PREFIX}${userId}`;

    const count = await this.cacheService.getOrSet<number>(
      cacheKey,
      async () => {
        return this.notificationRepo.count({
          where: {
            userId,
            status: NotificationStatus.UNREAD,
          },
        });
      },
      this.UNREAD_COUNT_TTL,
    );

    return { count };
  }

  // ──────────────────────────────────────────────
  //  Archive notification
  // ──────────────────────────────────────────────

  async archiveNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.ARCHIVED;
    const updated = await this.notificationRepo.save(notification);
    await this.invalidateUnreadCountCache(userId);

    this.notificationsGateway.notifyUser(userId, 'notification:archived', {
      id: notificationId,
    });

    return updated;
  }

  // ──────────────────────────────────────────────
  //  Dismiss notification
  // ──────────────────────────────────────────────

  async dismissNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.DISMISSED;
    const updated = await this.notificationRepo.save(notification);
    await this.invalidateUnreadCountCache(userId);

    this.notificationsGateway.notifyUser(userId, 'notification:dismissed', {
      id: notificationId,
    });

    return updated;
  }

  // ──────────────────────────────────────────────
  //  Smart Notification Batching
  // ──────────────────────────────────────────────

  /**
   * Hourly digest: batch medium-priority unread notifications
   * for users who have EMAIL digest set to DAILY or WEEKLY.
   */
  @Cron('0 * * * *') // Every hour
  async processHourlyDigest(): Promise<void> {
    this.logger.log('Processing hourly notification digest...');

    try {
      // Find users with unread medium-priority notifications
      const notifications = await this.notificationRepo
        .createQueryBuilder('n')
        .select('n.user_id', 'userId')
        .addSelect('COUNT(*)', 'count')
        .where('n.status = :status', { status: NotificationStatus.UNREAD })
        .andWhere('n.priority = :priority', { priority: NotificationPriority.NORMAL })
        .andWhere('n.channel = :channel', { channel: NotificationChannel.IN_APP })
        .andWhere("n.created_at > NOW() - INTERVAL '1 hour'")
        .groupBy('n.user_id')
        .having('COUNT(*) >= :minCount', { minCount: 3 })
        .getRawMany<{ userId: string; count: string }>();

      for (const { userId, count } of notifications) {
        const preference = await this.getOrCreatePreference(userId);
        if (
          preference.emailDigest === EmailDigestFrequency.DAILY ||
          preference.emailDigest === EmailDigestFrequency.WEEKLY
        ) {
          continue; // Skip — they'll get it in the daily/weekly digest
        }

        if (preference.emailDigest === EmailDigestFrequency.NONE) {
          continue;
        }

        // Send hourly digest email
        const recentNotifications = await this.notificationRepo.find({
          where: {
            userId,
            status: NotificationStatus.UNREAD,
            priority: NotificationPriority.NORMAL,
          },
          order: { createdAt: 'DESC' },
          take: 10,
        });

        if (recentNotifications.length > 0) {
          const digestBody = recentNotifications
            .map((n) => `• ${n.title}: ${n.body}`)
            .join('\n');

          this.emailService
            .sendNotification(
              userId,
              `You have ${count} new notifications`,
              digestBody,
            )
            .catch((err) =>
              this.logger.error(`Failed to send hourly digest to ${userId}`, err),
            );
        }
      }

      this.logger.log(`Hourly digest processed for ${notifications.length} user(s)`);
    } catch (error) {
      this.logger.error('Failed to process hourly digest', error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Daily digest: batch low-priority notifications into a single digest email.
   * Runs at 8:00 AM UTC every day.
   */
  @Cron('0 8 * * *')
  async processDailyDigest(): Promise<void> {
    this.logger.log('Processing daily notification digest...');

    try {
      // Find users who have daily digest enabled
      const preferences = await this.preferenceRepo.find({
        where: { emailDigest: EmailDigestFrequency.DAILY },
      });

      for (const pref of preferences) {
        const unreadNotifications = await this.notificationRepo.find({
          where: {
            userId: pref.userId,
            status: NotificationStatus.UNREAD,
          },
          order: { priority: 'ASC', createdAt: 'DESC' },
          take: 25,
        });

        if (unreadNotifications.length === 0) {
          continue;
        }

        // Group by type for organized digest
        const grouped = new Map<string, typeof unreadNotifications>();
        for (const notif of unreadNotifications) {
          const key = notif.type;
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(notif);
        }

        let digestBody = `You have ${unreadNotifications.length} unread notification(s):\n\n`;
        for (const [type, items] of grouped) {
          digestBody += `── ${type.toUpperCase()} ──\n`;
          for (const item of items) {
            digestBody += `• ${item.title}\n`;
          }
          digestBody += '\n';
        }

        this.emailService
          .sendNotification(
            pref.userId,
            `Your daily notification digest (${unreadNotifications.length} updates)`,
            digestBody,
          )
          .catch((err) =>
            this.logger.error(`Failed to send daily digest to ${pref.userId}`, err),
          );
      }

      this.logger.log(`Daily digest processed for ${preferences.length} user(s)`);
    } catch (error) {
      this.logger.error('Failed to process daily digest', error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Weekly digest: comprehensive summary of the week's notifications.
   * Runs Monday at 9:00 AM UTC.
   */
  @Cron('0 9 * * 1')
  async processWeeklyDigest(): Promise<void> {
    this.logger.log('Processing weekly notification digest...');

    try {
      const preferences = await this.preferenceRepo.find({
        where: { emailDigest: EmailDigestFrequency.WEEKLY },
      });

      for (const pref of preferences) {
        const weeklyNotifications = await this.notificationRepo
          .createQueryBuilder('n')
          .where('n.user_id = :userId', { userId: pref.userId })
          .andWhere("n.created_at > NOW() - INTERVAL '7 days'")
          .orderBy('n.priority', 'ASC')
          .addOrderBy('n.created_at', 'DESC')
          .take(50)
          .getMany();

        if (weeklyNotifications.length === 0) {
          continue;
        }

        const unreadCount = weeklyNotifications.filter(
          (n) => n.status === NotificationStatus.UNREAD,
        ).length;

        let digestBody = `Weekly Summary: ${weeklyNotifications.length} notification(s) this week`;
        if (unreadCount > 0) {
          digestBody += ` (${unreadCount} unread)`;
        }
        digestBody += '\n\n';

        const grouped = new Map<string, typeof weeklyNotifications>();
        for (const notif of weeklyNotifications) {
          const key = notif.type;
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(notif);
        }

        for (const [type, items] of grouped) {
          digestBody += `── ${type.toUpperCase()} (${items.length}) ──\n`;
          for (const item of items.slice(0, 5)) {
            digestBody += `• ${item.title}\n`;
          }
          if (items.length > 5) {
            digestBody += `  ... and ${items.length - 5} more\n`;
          }
          digestBody += '\n';
        }

        this.emailService
          .sendNotification(
            pref.userId,
            `Your weekly notification digest (${weeklyNotifications.length} updates)`,
            digestBody,
          )
          .catch((err) =>
            this.logger.error(`Failed to send weekly digest to ${pref.userId}`, err),
          );
      }

      this.logger.log(`Weekly digest processed for ${preferences.length} user(s)`);
    } catch (error) {
      this.logger.error('Failed to process weekly digest', error instanceof Error ? error.stack : String(error));
    }
  }

  // ──────────────────────────────────────────────
  //  User preferences
  // ──────────────────────────────────────────────

  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    return this.getOrCreatePreference(userId);
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = await this.getOrCreatePreference(userId);

    // Merge categories -- security category can never be disabled
    if (dto.categories) {
      const mergedCategories = {
        ...preference.categories,
        ...dto.categories,
        security: true, // Enforce: security notifications can never be disabled
      };
      preference.categories = mergedCategories as NotificationCategories;
    }

    if (dto.channel !== undefined) {
      preference.channel = dto.channel;
    }

    if (dto.quietHoursEnabled !== undefined) {
      preference.quietHoursEnabled = dto.quietHoursEnabled;
    }

    if (dto.quietHoursStart !== undefined) {
      preference.quietHoursStart = dto.quietHoursStart;
    }

    if (dto.quietHoursEnd !== undefined) {
      preference.quietHoursEnd = dto.quietHoursEnd;
    }

    if (dto.timezone !== undefined) {
      preference.timezone = dto.timezone;
    }

    if (dto.emailDigest !== undefined) {
      preference.emailDigest = dto.emailDigest;
    }

    return this.preferenceRepo.save(preference);
  }

  // ──────────────────────────────────────────────
  //  Push subscription management
  // ──────────────────────────────────────────────

  async subscribePush(
    userId: string,
    dto: PushSubscribeDto,
  ): Promise<PushSubscription> {
    // Check if subscription already exists for this endpoint
    const existing = await this.pushSubscriptionRepo.findOne({
      where: { userId, endpoint: dto.endpoint },
    });

    if (existing) {
      // Update existing subscription
      existing.keys = { p256dh: dto.keys.p256dh, auth: dto.keys.auth };
      existing.userAgent = dto.userAgent || null;
      existing.deviceName = dto.deviceName || null;
      existing.isActive = true;
      return this.pushSubscriptionRepo.save(existing);
    }

    // Create new subscription
    const subscription = this.pushSubscriptionRepo.create({
      userId,
      endpoint: dto.endpoint,
      keys: { p256dh: dto.keys.p256dh, auth: dto.keys.auth },
      userAgent: dto.userAgent || null,
      deviceName: dto.deviceName || null,
      isActive: true,
    });

    return this.pushSubscriptionRepo.save(subscription);
  }

  async unsubscribePush(userId: string, endpoint: string): Promise<void> {
    const subscription = await this.pushSubscriptionRepo.findOne({
      where: { userId, endpoint },
    });

    if (!subscription) {
      throw new NotFoundException('Push subscription not found');
    }

    subscription.isActive = false;
    await this.pushSubscriptionRepo.save(subscription);

    this.logger.log(`Push subscription deactivated for user ${userId}`);
  }

  async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      icon?: string | null;
      data?: Record<string, unknown>;
    },
  ): Promise<void> {
    const subscriptions = await this.pushSubscriptionRepo.find({
      where: { userId, isActive: true },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`No active push subscriptions for user ${userId}`);
      return;
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || undefined,
      data: payload.data || {},
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            pushPayload,
          );
        } catch (error: unknown) {
          const statusCode =
            error instanceof Object && 'statusCode' in error
              ? (error as { statusCode: number }).statusCode
              : null;

          // 410 Gone or 404 Not Found means the subscription is no longer valid
          if (statusCode === 410 || statusCode === 404) {
            this.logger.log(
              `Push subscription expired for user ${userId}, deactivating`,
            );
            sub.isActive = false;
            await this.pushSubscriptionRepo.save(sub);
          } else {
            throw error;
          }
        }
      }),
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      this.logger.warn(
        `${failed}/${subscriptions.length} push notifications failed for user ${userId}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async getOrCreatePreference(
    userId: string,
  ): Promise<NotificationPreference> {
    let preference = await this.preferenceRepo.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.preferenceRepo.create({
        userId,
        categories: { ...DEFAULT_NOTIFICATION_CATEGORIES },
      });
      preference = await this.preferenceRepo.save(preference);
      this.logger.log(`Created default notification preferences for user ${userId}`);
    }

    return preference;
  }

  /**
   * Check whether the current time falls within the user's quiet hours,
   * respecting their configured timezone.
   */
  private isQuietHours(preference: NotificationPreference): boolean {
    if (!preference.quietHoursEnabled) {
      return false;
    }

    if (!preference.quietHoursStart || !preference.quietHoursEnd) {
      return false;
    }

    try {
      // Get current time in user's timezone
      const now = new Date();
      const userTime = new Intl.DateTimeFormat('en-US', {
        timeZone: preference.timezone || 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      const [currentHour, currentMinute] = userTime.split(':').map(Number);
      const currentMinutes = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = preference.quietHoursStart
        .split(':')
        .map(Number);
      const startMinutes = startHour * 60 + startMinute;

      const [endHour, endMinute] = preference.quietHoursEnd
        .split(':')
        .map(Number);
      const endMinutes = endHour * 60 + endMinute;

      // Handle overnight quiet hours (e.g. 22:00 - 08:00)
      if (startMinutes > endMinutes) {
        // Quiet hours span midnight
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }

      // Same-day quiet hours (e.g. 13:00 - 15:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } catch (error) {
      this.logger.warn(
        `Failed to compute quiet hours for timezone ${preference.timezone}: ${error}`,
      );
      return false;
    }
  }

  /**
   * Determine whether a notification should be sent to a specific channel
   * based on the user's preference categories.
   */
  private async shouldSendToChannel(
    userId: string,
    category: keyof NotificationCategories,
    channel: NotificationChannel,
  ): Promise<boolean> {
    const preference = await this.getOrCreatePreference(userId);

    // Check if the category is enabled in user preferences
    const categoryEnabled = preference.categories[category];
    if (!categoryEnabled) {
      return false;
    }

    return true;
  }

  /**
   * Invalidate the cached unread count for a user.
   */
  private async invalidateUnreadCountCache(userId: string): Promise<void> {
    const cacheKey = `${this.UNREAD_COUNT_CACHE_PREFIX}${userId}`;
    await this.cacheService.invalidate(cacheKey);
  }
}
