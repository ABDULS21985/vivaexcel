import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsPeriod, ReportGroupBy } from '../enums/analytics.enums';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: AnalyticsPeriod,
    description: 'Predefined time period for analytics',
    default: AnalyticsPeriod.THIRTY_DAYS,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod = AnalyticsPeriod.THIRTY_DAYS;

  @ApiPropertyOptional({ description: 'Custom range start date (ISO 8601)', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Custom range end date (ISO 8601)', example: '2025-01-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ReportGroupBy,
    description: 'Group results by time interval',
    default: ReportGroupBy.DAY,
  })
  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy = ReportGroupBy.DAY;

  @ApiPropertyOptional({ description: 'Maximum number of results to return', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
