import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ApiKeyEnvironment, ApiKeyStatus } from '../enums/api-key.enums';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'key_hash', type: 'varchar', length: 255 })
  keyHash: string;

  @Column({ name: 'key_prefix', type: 'varchar', length: 12 })
  keyPrefix: string;

  @Column({
    type: 'enum',
    enum: ApiKeyEnvironment,
    default: ApiKeyEnvironment.LIVE,
  })
  environment: ApiKeyEnvironment;

  @Column({ type: 'jsonb', default: ['products:read'] })
  scopes: string[];

  @Column({ name: 'rate_limit', type: 'int', default: 60 })
  rateLimit: number;

  @Column({ name: 'allowed_origins', type: 'jsonb', default: [] })
  allowedOrigins: string[];

  @Column({ name: 'allowed_ips', type: 'jsonb', default: [] })
  allowedIPs: string[];

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'request_count', type: 'int', default: 0 })
  requestCount: number;

  @Column({ name: 'monthly_request_count', type: 'int', default: 0 })
  monthlyRequestCount: number;

  @Column({ name: 'monthly_request_limit', type: 'int', default: 10000 })
  monthlyRequestLimit: number;

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_reason', type: 'varchar', length: 255, nullable: true })
  revokedReason: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
