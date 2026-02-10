import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WebhookDeliveryStatus, WebhookEvent } from '../enums/webhook.enums';

export class DeliveryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by endpoint ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  endpointId?: string;

  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: WebhookEvent,
  })
  @IsOptional()
  @IsEnum(WebhookEvent)
  event?: WebhookEvent;

  @ApiPropertyOptional({
    description: 'Filter by delivery status',
    enum: WebhookDeliveryStatus,
  })
  @IsOptional()
  @IsEnum(WebhookDeliveryStatus)
  status?: WebhookDeliveryStatus;

  @ApiPropertyOptional({
    description: 'Filter deliveries created after this date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter deliveries created before this date',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
