import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId', 'tokenFamily'])
@Index(['tokenHash'])
@Index(['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 64 })
  tokenFamily!: string;

  @Column({ type: 'varchar', length: 128 })
  tokenHash!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  correlationId!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  revokedReason!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
