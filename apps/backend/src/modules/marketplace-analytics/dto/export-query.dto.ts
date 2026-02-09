import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsIn } from 'class-validator';
import { AnalyticsScope } from '../enums/analytics.enums';

export class ExportQueryDto {
  @ApiProperty({ description: 'Export file format', enum: ['csv', 'json'] })
  @IsIn(['csv', 'json'])
  format: 'csv' | 'json';

  @ApiProperty({ description: 'Export range start date (ISO 8601)', example: '2025-01-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'Export range end date (ISO 8601)', example: '2025-01-31' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ enum: AnalyticsScope, description: 'Scope of the exported analytics' })
  @IsOptional()
  @IsEnum(AnalyticsScope)
  scope?: AnalyticsScope;

  @ApiPropertyOptional({ description: 'Scope entity ID (seller or product UUID)' })
  @IsOptional()
  @IsUUID()
  scopeId?: string;
}
