import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('membership_tiers')
export class MembershipTier extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'monthly_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  monthlyPrice: number;

  @Column({
    name: 'annual_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  annualPrice: number;

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
