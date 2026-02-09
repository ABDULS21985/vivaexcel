import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ServiceDeliverableResponseDto } from './service-deliverable-response.dto';

@Exclude()
export class ServiceTowerSummaryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  shortName: string;

  @Expose()
  @ApiProperty()
  code: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  icon: string;

  @Expose()
  @ApiProperty()
  accentColor: string;
}

@Exclude()
export class DurationRangeResponseDto {
  @Expose()
  @ApiProperty({ example: '2 weeks' })
  min: string;

  @Expose()
  @ApiProperty({ example: '3 months' })
  max: string;
}

@Exclude()
export class CatalogServiceResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiPropertyOptional()
  scope?: string;

  @Expose()
  @ApiProperty()
  icon: string;

  @Expose()
  @ApiProperty()
  towerId: string;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  typicalDeliverables?: string[];

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  outcomes?: string[];

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  engagementTypes?: string[];

  @Expose()
  @ApiPropertyOptional({ type: DurationRangeResponseDto })
  @Type(() => DurationRangeResponseDto)
  durationRange?: DurationRangeResponseDto;

  @Expose()
  @ApiProperty()
  displayOrder: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  isFeatured: boolean;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  relatedServiceIds?: string[];

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  industryTags?: string[];

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @Expose()
  @ApiPropertyOptional({ type: ServiceTowerSummaryResponseDto })
  @Type(() => ServiceTowerSummaryResponseDto)
  tower?: ServiceTowerSummaryResponseDto;

  @Expose()
  @ApiPropertyOptional({ type: [ServiceDeliverableResponseDto] })
  @Type(() => ServiceDeliverableResponseDto)
  deliverables?: ServiceDeliverableResponseDto[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class CatalogServiceListResponseDto {
  @ApiProperty({ type: [CatalogServiceResponseDto] })
  @Type(() => CatalogServiceResponseDto)
  items: CatalogServiceResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
