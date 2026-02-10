import { Entity, Column, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from '../common/constants/roles.constant';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Media } from './media.entity';
import { OrganizationMember } from '../modules/organizations/entities/organization-member.entity';
import { Subscription } from './subscription.entity';
import { Bookmark } from './bookmark.entity';
import { ReadingHistory } from './reading-history.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ nullable: true, unique: true })
  @Index()
  username?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'simple-array', default: Role.VIEWER })
  roles: Role[];

  @Column({ type: 'simple-array', nullable: true })
  permissions?: string[];

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true, select: false })
  twoFactorSecret?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @Column({ name: 'is_creator', default: false })
  isCreator: boolean;

  @Column({ type: 'jsonb', nullable: true })
  specialties?: string[];

  get name(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Alias for avatar to match AuthService expectations
  get avatarUrl(): string | undefined {
    return this.avatar;
  }

  set avatarUrl(value: string | undefined) {
    this.avatar = value;
  }

  // Relations
  @OneToMany(() => Post, (post) => post.author)
  blogPosts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  blogComments: Comment[];

  @OneToMany(() => Media, (media) => media.uploader)
  uploadedAssets: Media[];

  @OneToMany(() => OrganizationMember, (member) => member.user)
  organizationMemberships: OrganizationMember[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription?: Subscription;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => ReadingHistory, (history) => history.user)
  readingHistory: ReadingHistory[];
}
