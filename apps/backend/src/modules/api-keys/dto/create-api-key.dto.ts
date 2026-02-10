import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
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
import { ApiKeyEnvironment, ApiKeyScope } from '../enums/api-key.enums';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Human-readable name for the API key',
    example: 'My Storefront Integration',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Scopes granted to this API key',
    enum: ApiKeyScope,
    isArray: true,
    example: [ApiKeyScope.PRODUCTS_READ, ApiKeyScope.CART_WRITE],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ApiKeyScope, { each: true })
  scopes: ApiKeyScope[];

  @ApiPropertyOptional({
    description: 'Environment for the API key',
    enum: ApiKeyEnvironment,
    default: ApiKeyEnvironment.LIVE,
  })
  @IsOptional()
  @IsEnum(ApiKeyEnvironment)
  environment?: ApiKeyEnvironment;

  @ApiPropertyOptional({
    description: 'Rate limit in requests per minute',
    example: 60,
    default: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rateLimit?: number;

  @ApiPropertyOptional({
    description: 'Allowed origins for CORS (empty array means all origins)',
    example: ['https://mystore.com', 'https://staging.mystore.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @ApiPropertyOptional({
    description: 'Allowed IP addresses (empty array means all IPs)',
    example: ['192.168.1.1', '10.0.0.0/24'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPs?: string[];

  @ApiPropertyOptional({
    description: 'Monthly request limit',
    example: 10000,
    default: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000000)
  monthlyRequestLimit?: number;

  @ApiPropertyOptional({
    description: 'Expiration date for the API key (null means no expiration)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
