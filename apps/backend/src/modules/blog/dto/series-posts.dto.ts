import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';

export class AddPostToSeriesDto {
  @ApiProperty({ description: 'Post ID to add to the series' })
  @IsUUID()
  postId: string;

  @ApiPropertyOptional({
    description: 'Position of the post in the series (1-based)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

export class ReorderSeriesPostsDto {
  @ApiProperty({
    description: 'Ordered array of post IDs representing the new order',
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  postIds: string[];
}
