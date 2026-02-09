import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsObject } from 'class-validator';
import { ConversionEventType } from '../enums/analytics.enums';

export class TrackConversionDto {
  @ApiPropertyOptional({ description: 'Digital product ID related to this conversion event' })
  @IsOptional()
  @IsUUID()
  digitalProductId?: string;

  @ApiProperty({ description: 'Unique session identifier' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: ConversionEventType, description: 'Type of conversion event' })
  @IsEnum(ConversionEventType)
  eventType: ConversionEventType;

  @ApiPropertyOptional({ description: 'Additional event metadata (cart value, coupon, etc.)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
