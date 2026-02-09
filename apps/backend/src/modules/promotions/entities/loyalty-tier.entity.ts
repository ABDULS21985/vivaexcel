import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { LoyaltyTierName } from '../enums/promotion.enums';

@Entity('loyalty_tiers')
export class LoyaltyTier extends BaseEntity {
  @Index({ unique: true })
  @Column({
    type: 'enum',
    enum: LoyaltyTierName,
    unique: true,
  })
  name!: LoyaltyTierName;

  @Column({
    name: 'minimum_spend',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  minimumSpend!: number;

  @Column({
    name: 'discount_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  discountPercentage!: number;

  @Column({ type: 'jsonb', nullable: true })
  perks!: Record<string, any> | null;

  @Column({
    name: 'icon_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  iconUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  color!: string | null;
}
