import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ServiceStatus } from '../../../entities/service.entity';

export class ServiceCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

@Exclude()
export class ServiceResponseDto {
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
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiPropertyOptional()
  content?: string;

  @Expose()
  @ApiPropertyOptional()
  price?: number;

  @Expose()
  @ApiPropertyOptional()
  priceType?: string;

  @Expose()
  @ApiProperty({ enum: ServiceStatus })
  status: ServiceStatus;

  @Expose()
  @ApiPropertyOptional()
  featuredImage?: string;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  images?: string[];

  @Expose()
  @ApiPropertyOptional()
  categoryId?: string;

  @Expose()
  @ApiPropertyOptional({ type: ServiceCategoryResponseDto })
  @Type(() => ServiceCategoryResponseDto)
  category?: ServiceCategoryResponseDto;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  features?: string[];

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  metaTitle?: string;

  @Expose()
  @ApiPropertyOptional()
  metaDescription?: string;

  @Expose()
  @ApiProperty()
  order: number;

  @Expose()
  @ApiProperty()
  isFeatured: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class ServiceListResponseDto {
  @ApiProperty({ type: [ServiceResponseDto] })
  @Type(() => ServiceResponseDto)
  items: ServiceResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
