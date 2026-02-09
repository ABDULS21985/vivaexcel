import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class TrackPageViewDto {
  @ApiPropertyOptional({ description: 'Post ID being viewed' })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @ApiProperty({ description: 'Path of the page viewed', example: '/blog/my-post' })
  @IsString()
  @MaxLength(2048)
  path: string;

  @ApiPropertyOptional({ description: 'HTTP referrer' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  referrer?: string;

  @ApiPropertyOptional({ description: 'Session ID for tracking unique sessions' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;
}
