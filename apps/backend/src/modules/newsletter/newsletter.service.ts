import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { nanoid } from 'nanoid';
import { NewsletterRepository } from './newsletter.repository';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { SubscriberQueryDto } from './dto/subscriber-query.dto';
import { NewsletterSubscriber, SubscriberStatus } from '../../entities/newsletter-subscriber.entity';
import { Newsletter, NewsletterStatus, NewsletterSegment } from './entities/newsletter.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    @InjectRepository(Newsletter)
    private readonly newsletterRepo: Repository<Newsletter>,
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepo: Repository<NewsletterSubscriber>,
    private readonly emailService: EmailService,
  ) {}

  async findAll(query: SubscriberQueryDto): Promise<ApiResponse<PaginatedResponse<NewsletterSubscriber>>> {
    const result = await this.newsletterRepository.findAll(query);
    return {
      status: 'success',
      message: 'Subscribers retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<NewsletterSubscriber>> {
    const subscriber = await this.newsletterRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Subscriber retrieved successfully',
      data: subscriber,
    };
  }

  async subscribe(
    subscribeDto: SubscribeDto,
    ipAddress?: string,
  ): Promise<ApiResponse<NewsletterSubscriber>> {
    // Check if email already exists
    const existing = await this.newsletterRepository.findByEmail(subscribeDto.email);

    if (existing) {
      if (existing.status === SubscriberStatus.ACTIVE) {
        throw new ConflictException('Email is already subscribed');
      }

      // Resubscribe if previously unsubscribed
      if (existing.status === SubscriberStatus.UNSUBSCRIBED) {
        const confirmationToken = nanoid(32);
        const updatedSubscriber = await this.newsletterRepository.update(existing.id, {
          name: subscribeDto.name,
          status: SubscriberStatus.PENDING,
          confirmationToken,
          unsubscribedAt: undefined,
          tags: subscribeDto.tags,
          ipAddress,
        });

        return {
          status: 'success',
          message: 'Please check your email to confirm your subscription',
          data: updatedSubscriber!,
        };
      }

      // Resend confirmation if still pending
      if (existing.status === SubscriberStatus.PENDING) {
        return {
          status: 'success',
          message: 'A confirmation email has already been sent. Please check your inbox.',
          data: existing,
        };
      }
    }

    // Create new subscriber
    const confirmationToken = nanoid(32);
    const unsubscribeToken = nanoid(32);

    const subscriber = await this.newsletterRepository.create({
      ...subscribeDto,
      confirmationToken,
      unsubscribeToken,
      status: SubscriberStatus.PENDING,
      ipAddress,
    });

    return {
      status: 'success',
      message: 'Please check your email to confirm your subscription',
      data: subscriber,
    };
  }

  async confirmSubscription(token: string): Promise<ApiResponse<NewsletterSubscriber>> {
    const subscriber = await this.newsletterRepository.findByConfirmationToken(token);

    if (!subscriber) {
      throw new NotFoundException('Invalid or expired confirmation token');
    }

    if (subscriber.status === SubscriberStatus.ACTIVE) {
      return {
        status: 'success',
        message: 'Subscription already confirmed',
        data: subscriber,
      };
    }

    const updatedSubscriber = await this.newsletterRepository.update(subscriber.id, {
      status: SubscriberStatus.ACTIVE,
      confirmedAt: new Date(),
      confirmationToken: undefined,
    });

    // Send welcome email
    await this.emailService.sendNewsletterWelcome({
      email: subscriber.email,
      firstName: subscriber.name?.split(' ')[0] || null,
      lastName: subscriber.name?.split(' ').slice(1).join(' ') || null,
    });

    return {
      status: 'success',
      message: 'Subscription confirmed successfully',
      data: updatedSubscriber!,
    };
  }

  async unsubscribe(unsubscribeDto: UnsubscribeDto): Promise<ApiResponse<null>> {
    let subscriber: NewsletterSubscriber | null = null;

    // Try to find by token first (more secure)
    if (unsubscribeDto.token) {
      subscriber = await this.newsletterRepository.findByUnsubscribeToken(unsubscribeDto.token);
    }

    // Fall back to email
    if (!subscriber) {
      subscriber = await this.newsletterRepository.findByEmail(unsubscribeDto.email);
    }

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      return {
        status: 'success',
        message: 'You have already unsubscribed',
        data: null,
      };
    }

    await this.newsletterRepository.update(subscriber.id, {
      status: SubscriberStatus.UNSUBSCRIBED,
      unsubscribedAt: new Date(),
    });

    return {
      status: 'success',
      message: 'You have been unsubscribed successfully',
      data: null,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const subscriber = await this.newsletterRepository.findById(id);
    if (!subscriber) {
      throw new NotFoundException(`Subscriber with ID "${id}" not found`);
    }

    await this.newsletterRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Subscriber deleted successfully',
      data: null,
    };
  }

  async getStats(): Promise<ApiResponse<{ pending: number; active: number; unsubscribed: number; total: number }>> {
    const [pendingCount, activeCount, unsubscribedCount, total] = await Promise.all([
      this.newsletterRepository.countByStatus(SubscriberStatus.PENDING),
      this.newsletterRepository.countByStatus(SubscriberStatus.ACTIVE),
      this.newsletterRepository.countByStatus(SubscriberStatus.UNSUBSCRIBED),
      this.newsletterRepository.countByStatus(),
    ]);

    return {
      status: 'success',
      message: 'Newsletter stats retrieved successfully',
      data: {
        pending: pendingCount,
        active: activeCount,
        unsubscribed: unsubscribedCount,
        total,
      },
    };
  }

  // ─── Newsletter Campaign Methods ────────────────────────────────────

  /**
   * Send a newsletter to all matching subscribers
   */
  async sendNewsletter(newsletterId: string): Promise<ApiResponse<Newsletter>> {
    const newsletter = await this.newsletterRepo.findOne({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new NotFoundException(`Newsletter with ID "${newsletterId}" not found`);
    }

    if (newsletter.status === NewsletterStatus.SENT) {
      throw new BadRequestException('This newsletter has already been sent');
    }

    if (newsletter.status === NewsletterStatus.SENDING) {
      throw new BadRequestException('This newsletter is currently being sent');
    }

    if (!newsletter.content) {
      throw new BadRequestException('Newsletter content is empty');
    }

    // Mark as sending
    await this.newsletterRepo.update(newsletterId, {
      status: NewsletterStatus.SENDING,
    });

    try {
      // Get active subscribers for the target segment
      const subscribers = await this.getSubscribersBySegment(newsletter.segment);

      let sentCount = 0;

      for (const subscriber of subscribers) {
        const sent = await this.emailService.sendNewsletterEmail(
          subscriber.email,
          newsletter.subject,
          newsletter.content,
          subscriber.name || subscriber.email.split('@')[0],
          newsletter.preheaderText || undefined,
          subscriber.unsubscribeToken || undefined,
        );

        if (sent) {
          sentCount++;
        }
      }

      // Update newsletter status
      await this.newsletterRepo.update(newsletterId, {
        status: NewsletterStatus.SENT,
        sentAt: new Date(),
        sentCount,
        recipientCount: subscribers.length,
      });

      const updatedNewsletter = await this.newsletterRepo.findOne({
        where: { id: newsletterId },
      });

      this.logger.log(
        `Newsletter "${newsletter.name}" sent to ${sentCount}/${subscribers.length} subscribers`,
      );

      return {
        status: 'success',
        message: `Newsletter sent to ${sentCount} subscribers`,
        data: updatedNewsletter!,
      };
    } catch (error) {
      // Mark as failed if something goes wrong
      await this.newsletterRepo.update(newsletterId, {
        status: NewsletterStatus.FAILED,
      });

      this.logger.error(
        `Failed to send newsletter ${newsletterId}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new BadRequestException('Failed to send newsletter');
    }
  }

  /**
   * Schedule a newsletter for future sending
   */
  async scheduleNewsletter(
    newsletterId: string,
    scheduledFor: Date,
  ): Promise<ApiResponse<Newsletter>> {
    const newsletter = await this.newsletterRepo.findOne({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new NotFoundException(`Newsletter with ID "${newsletterId}" not found`);
    }

    if (newsletter.status === NewsletterStatus.SENT) {
      throw new BadRequestException('This newsletter has already been sent');
    }

    if (!newsletter.content) {
      throw new BadRequestException('Newsletter content is empty. Add content before scheduling.');
    }

    if (scheduledFor <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    await this.newsletterRepo.update(newsletterId, {
      status: NewsletterStatus.SCHEDULED,
      scheduledFor,
      scheduledAt: scheduledFor, // backward compat
    });

    const updatedNewsletter = await this.newsletterRepo.findOne({
      where: { id: newsletterId },
    });

    this.logger.log(
      `Newsletter "${newsletter.name}" scheduled for ${scheduledFor.toISOString()}`,
    );

    return {
      status: 'success',
      message: `Newsletter scheduled for ${scheduledFor.toISOString()}`,
      data: updatedNewsletter!,
    };
  }

  /**
   * Send a new post notification to all active subscribers
   */
  async sendNewPostNotification(post: {
    title: string;
    excerpt: string;
    slug: string;
    coverImage?: string;
    authorName?: string;
  }): Promise<void> {
    const subscribers = await this.subscriberRepo.find({
      where: { status: SubscriberStatus.ACTIVE },
    });

    let sentCount = 0;

    for (const subscriber of subscribers) {
      const sent = await this.emailService.sendNewPostNotification(
        subscriber.email,
        subscriber.name || subscriber.email.split('@')[0],
        post,
        subscriber.unsubscribeToken || undefined,
      );

      if (sent) {
        sentCount++;
      }
    }

    this.logger.log(
      `New post notification for "${post.title}" sent to ${sentCount}/${subscribers.length} subscribers`,
    );
  }

  /**
   * Get analytics for a specific newsletter
   */
  async getAnalytics(newsletterId: string): Promise<ApiResponse<{
    newsletter: Newsletter;
    metrics: {
      recipientCount: number;
      sentCount: number;
      openCount: number;
      clickCount: number;
      openRate: number;
      clickRate: number;
    };
  }>> {
    const newsletter = await this.newsletterRepo.findOne({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new NotFoundException(`Newsletter with ID "${newsletterId}" not found`);
    }

    const openRate = newsletter.recipientCount > 0
      ? (newsletter.openCount / newsletter.recipientCount) * 100
      : 0;

    const clickRate = newsletter.recipientCount > 0
      ? (newsletter.clickCount / newsletter.recipientCount) * 100
      : 0;

    return {
      status: 'success',
      message: 'Newsletter analytics retrieved successfully',
      data: {
        newsletter,
        metrics: {
          recipientCount: newsletter.recipientCount,
          sentCount: newsletter.sentCount,
          openCount: newsletter.openCount,
          clickCount: newsletter.clickCount,
          openRate: Math.round(openRate * 100) / 100,
          clickRate: Math.round(clickRate * 100) / 100,
        },
      },
    };
  }

  /**
   * Send a test email for a newsletter to admin
   */
  async sendTestEmail(
    newsletterId: string,
    adminEmail: string,
  ): Promise<ApiResponse<null>> {
    const newsletter = await this.newsletterRepo.findOne({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new NotFoundException(`Newsletter with ID "${newsletterId}" not found`);
    }

    if (!newsletter.content) {
      throw new BadRequestException('Newsletter content is empty');
    }

    const sent = await this.emailService.sendNewsletterEmail(
      adminEmail,
      `[TEST] ${newsletter.subject}`,
      newsletter.content,
      'Admin',
      newsletter.preheaderText || undefined,
    );

    if (!sent) {
      throw new BadRequestException('Failed to send test email');
    }

    return {
      status: 'success',
      message: `Test email sent to ${adminEmail}`,
      data: null,
    };
  }

  /**
   * Process scheduled newsletters (called by cron job)
   */
  async processScheduledNewsletters(): Promise<void> {
    const now = new Date();

    const scheduledNewsletters = await this.newsletterRepo.find({
      where: {
        status: NewsletterStatus.SCHEDULED,
        scheduledFor: LessThanOrEqual(now),
      },
    });

    for (const newsletter of scheduledNewsletters) {
      this.logger.log(`Processing scheduled newsletter: ${newsletter.name} (${newsletter.id})`);

      try {
        await this.sendNewsletter(newsletter.id);
      } catch (error) {
        this.logger.error(
          `Failed to send scheduled newsletter ${newsletter.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────

  /**
   * Get active subscribers filtered by segment
   */
  private async getSubscribersBySegment(
    segment: NewsletterSegment,
  ): Promise<NewsletterSubscriber[]> {
    const qb = this.subscriberRepo
      .createQueryBuilder('subscriber')
      .where('subscriber.status = :status', { status: SubscriberStatus.ACTIVE });

    // For now, segment filtering is based on tags
    // When the subscription system matures, this can be linked to actual subscription tiers
    if (segment !== NewsletterSegment.ALL) {
      qb.andWhere(':segment = ANY(subscriber.tags)', { segment });
    }

    return qb.getMany();
  }
}
