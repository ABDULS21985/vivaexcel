import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
  timestamp?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Send a notification to a specific user
   */
  notifyUser(userId: string, notification: NotificationPayload): void {
    const payload = {
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString(),
    };

    this.gateway.notifyUser(userId, 'notification', payload);
    this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
  }

  /**
   * Send a notification to all admin users
   */
  notifyAdmins(notification: NotificationPayload): void {
    const payload = {
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString(),
    };

    this.gateway.notifyRoom('admins', 'notification', payload);
    this.logger.log(`Admin notification sent: ${notification.title}`);
  }

  /**
   * Notify about a new contact form submission
   */
  notifyNewContact(contact: {
    name: string;
    email: string;
    subject: string;
  }): void {
    this.notifyAdmins({
      title: 'New Contact Submission',
      message: `${contact.name} (${contact.email}) submitted: "${contact.subject}"`,
      type: 'info',
      data: { entity: 'contact', ...contact },
    });
  }

  /**
   * Notify about a new newsletter subscriber
   */
  notifyNewSubscriber(email: string): void {
    this.notifyAdmins({
      title: 'New Newsletter Subscriber',
      message: `${email} subscribed to the newsletter`,
      type: 'success',
      data: { entity: 'newsletter', email },
    });
  }

  /**
   * Notify about a new blog post being published
   */
  notifyNewPost(post: { title: string; slug: string; authorName: string }): void {
    this.gateway.broadcast('post:published', {
      title: post.title,
      slug: post.slug,
      authorName: post.authorName,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast: New post published "${post.title}"`);
  }

  /**
   * Send a real-time update to a specific room
   */
  sendUpdate(room: string, event: string, data: unknown): void {
    this.gateway.notifyRoom(room, event, data);
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(event: string, data: unknown): void {
    this.gateway.broadcast(event, data);
  }
}
