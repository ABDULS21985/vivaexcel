import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiKeyEnvironment, ApiKeyStatus } from '../enums/api-key.enums';

export class ApiKeyResponseDto {
  @ApiProperty({ description: 'API key ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'Owner user ID' })
  userId: string;

  @ApiProperty({
    description: 'Human-readable name',
    example: 'My Storefront Integration',
  })
  name: string;

  @ApiProperty({
    description: 'Key prefix for identification (first 12 chars)',
    example: 'kt_live_abc1',
  })
  keyPrefix: string;

  @ApiProperty({
    description: 'Environment',
    enum: ApiKeyEnvironment,
  })
  environment: ApiKeyEnvironment;

  @ApiProperty({
    description: 'Granted scopes',
    example: ['products:read', 'cart:write'],
  })
  scopes: string[];

  @ApiProperty({ description: 'Rate limit (requests per minute)', example: 60 })
  rateLimit: number;

  @ApiProperty({
    description: 'Allowed origins',
    example: ['https://mystore.com'],
  })
  allowedOrigins: string[];

  @ApiProperty({ description: 'Allowed IPs', example: [] })
  allowedIPs: string[];

  @ApiPropertyOptional({
    description: 'Last time the key was used',
    example: '2026-01-15T10:30:00Z',
  })
  lastUsedAt: Date | null;

  @ApiProperty({ description: 'Total request count', example: 1524 })
  requestCount: number;

  @ApiProperty({
    description: 'Monthly request count',
    example: 342,
  })
  monthlyRequestCount: number;

  @ApiProperty({
    description: 'Monthly request limit',
    example: 10000,
  })
  monthlyRequestLimit: number;

  @ApiProperty({ description: 'Key status', enum: ApiKeyStatus })
  status: ApiKeyStatus;

  @ApiPropertyOptional({
    description: 'When the key was revoked',
  })
  revokedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Reason for revocation',
  })
  revokedReason: string | null;

  @ApiPropertyOptional({
    description: 'Expiration date',
  })
  expiresAt: Date | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class ApiKeyCreatedResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    description:
      'The plain-text API key. This is the ONLY time the full key is shown. Store it securely.',
    example: 'kt_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  plainKey: string;
}
