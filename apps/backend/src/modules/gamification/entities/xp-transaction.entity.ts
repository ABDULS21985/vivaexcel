import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';
import { XPSource } from '../enums/gamification.enums';

@Entity('xp_transactions')
export class XPTransaction extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'enum', enum: XPSource })
  @Index()
  source!: XPSource;

  @Column({ name: 'reference_id', nullable: true })
  referenceId!: string | null;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
