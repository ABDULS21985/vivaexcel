import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { MarketplacePlan } from './marketplace-plan.entity';

export enum MarketplaceSubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

@Entity('marketplace_subscriptions')
export class MarketplaceSubscription extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'plan_id' })
  @Index()
  planId: string;

  @ManyToOne(() => MarketplacePlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: MarketplacePlan;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  @Index()
  stripeSubscriptionId?: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'enum', enum: MarketplaceSubscriptionStatus, default: MarketplaceSubscriptionStatus.ACTIVE })
  @Index()
  status: MarketplaceSubscriptionStatus;

  @Column({ name: 'billing_period', type: 'enum', enum: BillingPeriod, default: BillingPeriod.MONTHLY })
  billingPeriod: BillingPeriod;

  @Column({ name: 'current_period_start', type: 'timestamptz' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz' })
  currentPeriodEnd: Date;

  @Column({ name: 'credits_remaining', type: 'int', default: 0 })
  creditsRemaining: number;

  @Column({ name: 'credits_used_this_period', type: 'int', default: 0 })
  creditsUsedThisPeriod: number;

  @Column({ name: 'total_credits_used', type: 'int', default: 0 })
  totalCreditsUsed: number;

  @Column({ name: 'rollover_credits', type: 'int', default: 0 })
  rolloverCreditsAmount: number;

  @Column({ name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ name: 'paused_at', type: 'timestamptz', nullable: true })
  pausedAt?: Date;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
