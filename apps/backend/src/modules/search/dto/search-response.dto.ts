import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchResultItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  excerpt?: string;

  @ApiPropertyOptional()
  headline?: string;

  @ApiProperty()
  rank: number;

  @ApiPropertyOptional()
  featuredImage?: string;

  @ApiPropertyOptional()
  authorName?: string;

  @ApiPropertyOptional()
  categoryName?: string;

  @ApiPropertyOptional()
  categorySlug?: string;

  @ApiProperty()
  publishedAt: Date;
}

export class SearchResultDto {
  @ApiProperty({ type: [SearchResultItemDto] })
  items: SearchResultItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  query: string;
}

export class SearchSuggestionDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class PopularSearchDto {
  @ApiProperty()
  query: string;

  @ApiProperty()
  count: number;
}
