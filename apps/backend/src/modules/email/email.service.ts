import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface UserEmailData {
  id: string;
  email: string;
  name: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  company?: string | null;
  phone?: string | null;
}

export interface NewsletterSubscriberEmailData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly supportEmail: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.supportEmail =
      this.configService.get<string>('SUPPORT_EMAIL') || 'support@digiweb.com';
  }

  /**
   * Send email verification email to user
   */
  async sendVerificationEmail(
    user: UserEmailData,
    token: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify Your Email Address - DigiWeb',
        template: 'email-verification',
        context: {
          name: user.name,
          verificationUrl,
          expiresIn: '24 hours',
          supportEmail: this.supportEmail,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Verification email sent to ${user.email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send password reset email to user
   */
  async sendPasswordResetEmail(
    user: UserEmailData,
    token: string,
  ): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset Your Password - DigiWeb',
        template: 'password-reset',
        context: {
          name: user.name,
          resetUrl,
          expiresIn: '15 minutes',
          supportEmail: this.supportEmail,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: UserEmailData): Promise<boolean> {
    const loginUrl = `${this.frontendUrl}/auth/login`;
    const dashboardUrl = `${this.frontendUrl}/dashboard`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to DigiWeb!',
        template: 'welcome',
        context: {
          name: user.name,
          loginUrl,
          dashboardUrl,
          supportEmail: this.supportEmail,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send contact form confirmation email
   */
  async sendContactFormConfirmation(
    contact: ContactEmailData,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: contact.email,
        subject: 'We Received Your Message - DigiWeb',
        template: 'contact-confirmation',
        context: {
          name: contact.name,
          subject: contact.subject,
          message: contact.message,
          supportEmail: this.supportEmail,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Contact confirmation email sent to ${contact.email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send contact confirmation email to ${contact.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send newsletter welcome email to new subscriber
   */
  async sendNewsletterWelcome(
    subscriber: NewsletterSubscriberEmailData,
  ): Promise<boolean> {
    const unsubscribeUrl = `${this.frontendUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
    const name =
      subscriber.firstName ||
      subscriber.lastName ||
      subscriber.email.split('@')[0];

    try {
      await this.mailerService.sendMail({
        to: subscriber.email,
        subject: 'Welcome to the DigiWeb Newsletter!',
        template: 'newsletter-welcome',
        context: {
          name,
          unsubscribeUrl,
          supportEmail: this.supportEmail,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Newsletter welcome email sent to ${subscriber.email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send newsletter welcome email to ${subscriber.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send a generic notification email
   */
  async sendNotification(
    to: string,
    subject: string,
    content: string,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              ${content}
            </div>
            <footer style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} DigiWeb. All rights reserved.</p>
              <p>Questions? Contact us at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
            </footer>
          </body>
          </html>
        `,
      });

      this.logger.log(`Notification email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send notification email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Send email to admin about new contact submission
   */
  async sendContactNotificationToAdmin(
    contact: ContactEmailData,
  ): Promise<boolean> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not configured, skipping admin notification');
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `New Contact Form Submission: ${contact.subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Contact Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
              ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
              ${contact.company ? `<p><strong>Company:</strong> ${contact.company}</p>` : ''}
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${contact.message}</p>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Contact notification sent to admin`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send contact notification to admin`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
