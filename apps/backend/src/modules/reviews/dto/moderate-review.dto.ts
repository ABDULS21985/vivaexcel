import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../enums/review.enums';

export class ModerateReviewDto {
  @ApiProperty({
    enum: [ReviewStatus.APPROVED, ReviewStatus.REJECTED],
    description: 'Moderation decision',
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus, {
    message: 'Status must be either APPROVED or REJECTED',
  })
  status: ReviewStatus.APPROVED | ReviewStatus.REJECTED;

  @ApiPropertyOptional({ description: 'Reason for the moderation decision' })
  @IsOptional()
  @IsString()
  reason?: string;
}
