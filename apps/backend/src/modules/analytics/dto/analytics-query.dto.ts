import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export class AnalyticsPeriodDto {
  @ApiPropertyOptional({
    description: 'Time period for analytics data',
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  @IsOptional()
  @IsString()
  @IsIn(['7d', '30d', '90d'])
  period?: AnalyticsPeriod = '30d';
}
