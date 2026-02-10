import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUrl,
  IsArray,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { WebhookEvent } from '../enums/webhook.enums';

export class CreateEndpointDto {
  @ApiProperty({
    description: 'The URL to receive webhook payloads',
    example: 'https://example.com/webhooks/receiver',
  })
  @IsUrl({ require_tld: false }, { message: 'url must be a valid URL' })
  @MaxLength(2048)
  url!: string;

  @ApiProperty({
    description: 'List of events to subscribe to',
    enum: WebhookEvent,
    isArray: true,
    example: [WebhookEvent.ORDER_CREATED, WebhookEvent.PRODUCT_PUBLISHED],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one event must be specified' })
  @IsEnum(WebhookEvent, { each: true })
  events!: WebhookEvent[];

  @ApiPropertyOptional({
    description: 'Optional metadata for the endpoint',
    example: { label: 'Production', environment: 'prod' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
