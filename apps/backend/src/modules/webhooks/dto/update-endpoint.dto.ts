import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUrl,
  IsArray,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { WebhookEvent, WebhookEndpointStatus } from '../enums/webhook.enums';

export class UpdateEndpointDto {
  @ApiPropertyOptional({
    description: 'The URL to receive webhook payloads',
    example: 'https://example.com/webhooks/receiver',
  })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'url must be a valid URL' })
  @MaxLength(2048)
  url?: string;

  @ApiPropertyOptional({
    description: 'List of events to subscribe to',
    enum: WebhookEvent,
    isArray: true,
    example: [WebhookEvent.ORDER_CREATED, WebhookEvent.PRODUCT_PUBLISHED],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one event must be specified' })
  @IsEnum(WebhookEvent, { each: true })
  events?: WebhookEvent[];

  @ApiPropertyOptional({
    description: 'Enable or disable the endpoint',
    enum: [WebhookEndpointStatus.ACTIVE, WebhookEndpointStatus.DISABLED],
  })
  @IsOptional()
  @IsEnum(WebhookEndpointStatus, {
    message: 'status must be either active or disabled',
  })
  status?: WebhookEndpointStatus.ACTIVE | WebhookEndpointStatus.DISABLED;

  @ApiPropertyOptional({
    description: 'Optional metadata for the endpoint',
    example: { label: 'Staging', environment: 'staging' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
