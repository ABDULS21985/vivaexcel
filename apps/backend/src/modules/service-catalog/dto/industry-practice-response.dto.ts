import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class IndustryPracticeResponseDto {
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
  @ApiProperty()
  icon: string;

  @Expose()
  @ApiPropertyOptional()
  accentColor?: string | null;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  subSectors?: string[] | null;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  keyOfferings?: string[] | null;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  relatedTowerIds?: string[] | null;

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

export class IndustryPracticeListResponseDto {
  @ApiProperty({ type: [IndustryPracticeResponseDto] })
  @Type(() => IndustryPracticeResponseDto)
  items: IndustryPracticeResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export class IndustryPracticeSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  icon: string;

  @ApiPropertyOptional()
  accentColor?: string | null;
}
