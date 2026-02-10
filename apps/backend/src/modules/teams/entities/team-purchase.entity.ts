import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Team } from './team.entity';

export enum TeamPurchaseStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('team_purchases')
export class TeamPurchase extends BaseEntity {
  @Index()
  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @Index()
  @Column({ name: 'purchased_by', type: 'uuid' })
  purchasedBy!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TeamPurchaseStatus,
    default: TeamPurchaseStatus.PENDING_APPROVAL,
  })
  status!: TeamPurchaseStatus;

  @Column({ name: 'request_note', type: 'text', nullable: true })
  requestNote!: string | null;

  @Column({ name: 'approval_note', type: 'text', nullable: true })
  approvalNote!: string | null;

  @Column({ name: 'digital_product_id', type: 'uuid' })
  @Index()
  digitalProductId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'seat_count', type: 'int', default: 1 })
  seatCount!: number;

  // Relations
  @ManyToOne(() => Team, (team) => team.purchases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne('TeamMember', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchased_by' })
  purchaser!: any;

  @ManyToOne('TeamMember', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver!: any;

  @ManyToOne('DigitalProduct', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct!: any;

  @ManyToOne('Order', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'order_id' })
  order!: any;
}
