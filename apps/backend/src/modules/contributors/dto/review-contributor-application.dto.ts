import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewDecision {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewContributorApplicationDto {
  @ApiProperty({ description: 'Decision on the application', enum: ReviewDecision })
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @ApiPropertyOptional({ description: 'Notes from the reviewer' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reviewNotes?: string;
}
