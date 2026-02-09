import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductStatus } from '../../../entities/product.entity';

export class ProductCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

@Exclude()
export class ProductResponseDto {
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
  @ApiProperty()
  price: number;

  @Expose()
  @ApiPropertyOptional()
  salePrice?: number;

  @Expose()
  @ApiProperty({ enum: ProductStatus })
  status: ProductStatus;

  @Expose()
  @ApiPropertyOptional()
  sku?: string;

  @Expose()
  @ApiProperty()
  stock: number;

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
  @ApiPropertyOptional({ type: ProductCategoryResponseDto })
  @Type(() => ProductCategoryResponseDto)
  category?: ProductCategoryResponseDto;

  @Expose()
  @ApiPropertyOptional()
  attributes?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  metaTitle?: string;

  @Expose()
  @ApiPropertyOptional()
  metaDescription?: string;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  metaKeywords?: string[];

  @Expose()
  @ApiProperty()
  views: number;

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

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  @Type(() => ProductResponseDto)
  items: ProductResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
