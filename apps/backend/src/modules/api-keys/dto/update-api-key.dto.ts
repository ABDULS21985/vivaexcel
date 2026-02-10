import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDate,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiKeyScope } from '../enums/api-key.enums';

export class UpdateApiKeyDto {
  @ApiPropertyOptional({
    description: 'Human-readable name for the API key',
    example: 'My Updated Storefront Integration',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Scopes granted to this API key',
    enum: ApiKeyScope,
    isArray: true,
    example: [ApiKeyScope.PRODUCTS_READ, ApiKeyScope.CART_WRITE],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ApiKeyScope, { each: true })
  scopes?: ApiKeyScope[];

  @ApiPropertyOptional({
    description: 'Rate limit in requests per minute',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rateLimit?: number;

  @ApiPropertyOptional({
    description: 'Allowed origins for CORS (empty array means all origins)',
    example: ['https://mystore.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @ApiPropertyOptional({
    description: 'Allowed IP addresses (empty array means all IPs)',
    example: ['192.168.1.1'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPs?: string[];

  @ApiPropertyOptional({
    description: 'Monthly request limit',
    example: 50000,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000000)
  monthlyRequestLimit?: number;

  @ApiPropertyOptional({
    description: 'Expiration date for the API key',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
