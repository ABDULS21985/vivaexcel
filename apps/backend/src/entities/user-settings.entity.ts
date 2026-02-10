import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  // Notification preferences
  @Column({ name: 'email_product_updates', default: true })
  emailProductUpdates: boolean;

  @Column({ name: 'email_weekly_digest', default: true })
  emailWeeklyDigest: boolean;

  @Column({ name: 'email_comments_replies', default: true })
  emailCommentsReplies: boolean;

  @Column({ name: 'email_mentions', default: true })
  emailMentions: boolean;

  @Column({ name: 'email_newsletter', default: true })
  emailNewsletter: boolean;

  @Column({ name: 'email_marketing', default: false })
  emailMarketing: boolean;

  // Privacy settings
  @Column({ name: 'profile_visibility', default: 'public' })
  profileVisibility: string;

  @Column({ name: 'show_reading_history', default: true })
  showReadingHistory: boolean;

  @Column({ name: 'show_bookmarks', default: false })
  showBookmarks: boolean;

  @Column({ name: 'allow_analytics', default: true })
  allowAnalytics: boolean;

  // Preferences
  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  timezone: string;

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
