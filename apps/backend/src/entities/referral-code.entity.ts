import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('referral_codes')
export class ReferralCode extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index({ unique: true })
  userId: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column({ name: 'referral_count', type: 'int', default: 0 })
  referralCount: number;

  @Column({
    name: 'reward_earned',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  rewardEarned: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
