import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Post, PostStatus } from '../../../entities/post.entity';
import { NewsletterSubscriber, SubscriberStatus } from '../../../entities/newsletter-subscriber.entity';
import { EmailService } from '../../email/email.service';
import { CacheService } from '../../../common/cache/cache.service';

@Injectable()
export class PostSchedulerService {
  private readonly logger = new Logger(PostSchedulerService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Runs every minute to check for posts with status='scheduled'
   * and scheduledAt <= now. Publishes those posts and sends
   * notification emails to active newsletter subscribers.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts(): Promise<void> {
    if (this.isProcessing) {
      this.logger.debug(
        'Skipping scheduled post check - previous run still in progress',
      );
      return;
    }

    this.isProcessing = true;

    try {
      this.logger.debug('Checking for scheduled posts due for publishing...');

      const now = new Date();

      const scheduledPosts = await this.postRepository.find({
        where: {
          status: PostStatus.SCHEDULED,
          scheduledAt: LessThanOrEqual(now),
        },
        relations: ['author'],
      });

      if (scheduledPosts.length === 0) {
        this.logger.debug('No scheduled posts are due for publishing');
        return;
      }

      this.logger.log(
        `Found ${scheduledPosts.length} scheduled post(s) to publish`,
      );

      for (const post of scheduledPosts) {
        try {
          await this.publishScheduledPost(post);
        } catch (error) {
          this.logger.error(
            `Failed to publish scheduled post "${post.title}" (${post.id})`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error processing scheduled posts',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Publish a single scheduled post and notify subscribers.
   */
  private async publishScheduledPost(post: Post): Promise<void> {
    // Update post status to published
    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();
    await this.postRepository.save(post);

    this.logger.log(
      `Published scheduled post: "${post.title}" (${post.id})`,
    );

    // Invalidate posts cache
    await this.cacheService.invalidateByTags([
      'posts',
      `post:${post.id}`,
      `post:slug:${post.slug}`,
    ]);

    // Send notification emails to subscribers asynchronously
    this.notifySubscribers(post).catch((error) => {
      this.logger.error(
        `Failed to send notifications for post "${post.title}"`,
        error instanceof Error ? error.stack : String(error),
      );
    });
  }

  /**
   * Send new-post notification emails to all active newsletter subscribers.
   */
  private async notifySubscribers(post: Post): Promise<void> {
    const subscribers = await this.subscriberRepository.find({
      where: { status: SubscriberStatus.ACTIVE },
    });

    if (subscribers.length === 0) {
      this.logger.debug('No active subscribers to notify');
      return;
    }

    this.logger.log(
      `Sending new-post notifications to ${subscribers.length} subscriber(s) for "${post.title}"`,
    );

    const authorName = post.author
      ? `${post.author.firstName ?? ''} ${post.author.lastName ?? ''}`.trim()
      : undefined;

    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      const recipientName =
        subscriber.name || subscriber.email.split('@')[0];

      const sent = await this.emailService.sendNewPostNotification(
        subscriber.email,
        recipientName,
        {
          title: post.title,
          excerpt: post.excerpt || '',
          slug: post.slug,
          coverImage: post.featuredImage || undefined,
          authorName: authorName || 'The Team',
        },
        subscriber.unsubscribeToken || undefined,
      );

      if (sent) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.logger.log(
      `Post notification emails sent: ${successCount} success, ${failCount} failed for "${post.title}"`,
    );
  }
}
