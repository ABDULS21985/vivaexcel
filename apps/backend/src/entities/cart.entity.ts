import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

export enum CartStatus {
  ACTIVE = 'active',
  MERGED = 'merged',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
}

@Entity('carts')
export class Cart extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id', nullable: true, unique: true })
  @Index()
  sessionId?: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  @Index()
  status: CartStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: 'USD' })
  currency: string;

  // Relations

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}
