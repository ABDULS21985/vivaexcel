import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportReason } from '../enums/review.enums';

export class CreateReviewReportDto {
  @ApiProperty({
    enum: ReportReason,
    description: 'Reason for reporting this review',
    example: ReportReason.SPAM,
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'Additional details about the report' })
  @IsOptional()
  @IsString()
  details?: string;
}
