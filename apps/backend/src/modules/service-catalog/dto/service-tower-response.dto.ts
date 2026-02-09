import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CatalogServiceResponseDto } from './catalog-service-response.dto';

@Exclude()
export class ServiceTowerResponseDto {
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
  description: string;

  @Expose()
  @ApiPropertyOptional()
  scope?: string;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  typicalOutcomes?: string[];

  @Expose()
  @ApiProperty()
  icon: string;

  @Expose()
  @ApiProperty()
  accentColor: string;

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
  certifications?: string[];

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  frameworks?: string[];

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @Expose()
  @ApiPropertyOptional({ type: [CatalogServiceResponseDto] })
  @Type(() => CatalogServiceResponseDto)
  services?: CatalogServiceResponseDto[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class ServiceTowerListResponseDto {
  @ApiProperty({ type: [ServiceTowerResponseDto] })
  @Type(() => ServiceTowerResponseDto)
  items: ServiceTowerResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export class ServiceTowerSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  accentColor: string;

  @ApiProperty()
  serviceCount: number;
}
