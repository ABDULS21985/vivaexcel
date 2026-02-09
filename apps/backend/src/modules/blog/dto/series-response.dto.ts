import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SeriesStatus } from '../../../entities/post-series.entity';
import { AuthorResponseDto, PostResponseDto } from './post-response.dto';

export class SeriesResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  slug: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional()
  @Expose()
  coverImage?: string;

  @ApiProperty({ enum: SeriesStatus })
  @Expose()
  status: SeriesStatus;

  @ApiProperty()
  @Expose()
  createdBy: string;

  @ApiPropertyOptional({ type: AuthorResponseDto })
  @Expose()
  @Type(() => AuthorResponseDto)
  creator?: AuthorResponseDto;

  @ApiPropertyOptional({ type: [PostResponseDto] })
  @Expose()
  @Type(() => PostResponseDto)
  posts?: PostResponseDto[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class SeriesListResponseDto {
  @ApiProperty({ type: [SeriesResponseDto] })
  @Type(() => SeriesResponseDto)
  items: SeriesResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
