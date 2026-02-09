import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VoteType } from '../enums/review.enums';

export class CreateReviewVoteDto {
  @ApiProperty({
    enum: VoteType,
    description: 'Type of vote',
    example: VoteType.HELPFUL,
  })
  @IsEnum(VoteType)
  voteType: VoteType;
}
