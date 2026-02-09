import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class EngagementModelResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiPropertyOptional()
  durationRange?: string | null;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  typicalOutputs?: string[] | null;

  @Expose()
  @ApiProperty()
  icon: string;

  @Expose()
  @ApiPropertyOptional()
  accentColor?: string | null;

  @Expose()
  @ApiProperty()
  displayOrder: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, unknown> | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class EngagementModelListResponseDto {
  @ApiProperty({ type: [EngagementModelResponseDto] })
  @Type(() => EngagementModelResponseDto)
  items: EngagementModelResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
