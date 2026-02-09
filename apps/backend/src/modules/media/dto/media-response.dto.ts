import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MediaType } from '../../../entities/media.entity';

export class MediaFolderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

@Exclude()
export class MediaResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  filename: string;

  @Expose()
  @ApiProperty()
  originalName: string;

  @Expose()
  @ApiProperty()
  mimetype: string;

  @Expose()
  @ApiProperty()
  size: number;

  @Expose()
  @ApiProperty()
  path: string;

  @Expose()
  @ApiPropertyOptional()
  url?: string;

  @Expose()
  @ApiProperty({ enum: MediaType })
  type: MediaType;

  @Expose()
  @ApiPropertyOptional()
  alt?: string;

  @Expose()
  @ApiPropertyOptional()
  title?: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiPropertyOptional()
  width?: number;

  @Expose()
  @ApiPropertyOptional()
  height?: number;

  @Expose()
  @ApiPropertyOptional()
  folderId?: string;

  @Expose()
  @ApiPropertyOptional({ type: MediaFolderResponseDto })
  @Type(() => MediaFolderResponseDto)
  folder?: MediaFolderResponseDto;

  @Expose()
  @ApiPropertyOptional()
  storage?: string;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class MediaListResponseDto {
  @ApiProperty({ type: [MediaResponseDto] })
  @Type(() => MediaResponseDto)
  items: MediaResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
