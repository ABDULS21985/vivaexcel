import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AuthorResponseDto } from './post-response.dto';

export class RevisionResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  postId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  content?: string;

  @ApiPropertyOptional()
  @Expose()
  excerpt?: string;

  @ApiProperty()
  @Expose()
  revisionNumber: number;

  @ApiPropertyOptional()
  @Expose()
  changeDescription?: string;

  @ApiProperty()
  @Expose()
  createdBy: string;

  @ApiPropertyOptional({ type: AuthorResponseDto })
  @Expose()
  @Type(() => AuthorResponseDto)
  creator?: AuthorResponseDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

export class RevisionListResponseDto {
  @ApiProperty({ type: [RevisionResponseDto] })
  @Type(() => RevisionResponseDto)
  items: RevisionResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export class RevisionDiffResponseDto {
  @ApiProperty()
  @Expose()
  revision1: RevisionResponseDto;

  @ApiProperty()
  @Expose()
  revision2: RevisionResponseDto;

  @ApiProperty({ description: 'Array of diff entries between the two revisions' })
  @Expose()
  titleDiff: DiffEntry[];

  @ApiProperty()
  @Expose()
  contentDiff: DiffEntry[];

  @ApiProperty()
  @Expose()
  excerptDiff: DiffEntry[];
}

export class DiffEntry {
  @ApiProperty({ enum: ['added', 'removed', 'unchanged'] })
  type: 'added' | 'removed' | 'unchanged';

  @ApiProperty()
  value: string;
}
