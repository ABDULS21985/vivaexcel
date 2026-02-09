import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TrafficSource, DeviceType } from '../enums/analytics.enums';

export class TrackViewDto {
  @ApiProperty({ description: 'Digital product ID being viewed' })
  @IsUUID()
  digitalProductId: string;

  @ApiProperty({ description: 'Unique session identifier' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({
    enum: TrafficSource,
    description: 'Traffic source for this view',
    default: TrafficSource.DIRECT,
  })
  @IsOptional()
  @IsEnum(TrafficSource)
  source?: TrafficSource;

  @ApiPropertyOptional({ description: 'HTTP referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'UTM source parameter' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: 'UTM medium parameter' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ description: 'UTM campaign parameter' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional({ enum: DeviceType, description: 'Device type of the viewer' })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @ApiPropertyOptional({ description: 'Browser name' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ description: 'Operating system name' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code', example: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Region or state name' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Time spent on page in seconds', example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Scroll depth percentage (0-100)', example: 75 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  scrollDepth?: number;
}
