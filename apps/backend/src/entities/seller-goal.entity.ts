import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SellerProfile } from './seller-profile.entity';

export enum GoalType {
  REVENUE = 'revenue',
  SALES = 'sales',
  PRODUCTS = 'products',
  RATING = 'rating',
}

export enum GoalStatus {
  ACTIVE = 'active',
  ACHIEVED = 'achieved',
  MISSED = 'missed',
  CANCELED = 'canceled',
}

@Entity('seller_goals')
@Index(['sellerId', 'status'])
export class SellerGoal extends BaseEntity {
  @Column({ name: 'seller_id', type: 'uuid' })
  @Index()
  sellerId: string;

  @Column({
    type: 'enum',
    enum: GoalType,
  })
  type: GoalType;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({
    name: 'target_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  targetValue: number;

  @Column({
    name: 'current_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  currentValue: number;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.ACTIVE,
  })
  status: GoalStatus;

  // Relations
  @ManyToOne(() => SellerProfile)
  @JoinColumn({ name: 'seller_id' })
  seller: SellerProfile;
}
