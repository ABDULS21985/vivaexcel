import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PostStatus, PostVisibility, MembershipTierLevel } from '../../../entities/post.entity';

export class AuthorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  avatar?: string;
}

export class BlogCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class BlogTagResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

@Exclude()
export class PostResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiPropertyOptional()
  subtitle?: string;

  @Expose()
  @ApiPropertyOptional()
  excerpt?: string;

  @Expose()
  @ApiPropertyOptional()
  content?: string;

  @Expose()
  @ApiProperty({ enum: PostStatus })
  status: PostStatus;

  @Expose()
  @ApiProperty({ enum: PostVisibility })
  visibility: PostVisibility;

  @Expose()
  @ApiPropertyOptional({ enum: MembershipTierLevel })
  minimumTier?: MembershipTierLevel;

  @Expose()
  @ApiPropertyOptional()
  series?: string;

  @Expose()
  @ApiPropertyOptional()
  seriesOrder?: number;

  @Expose()
  @ApiPropertyOptional()
  canonicalUrl?: string;

  @Expose()
  @ApiProperty()
  noIndex: boolean;

  @Expose()
  @ApiProperty()
  wordCount: number;

  @Expose()
  @ApiPropertyOptional()
  paywalled?: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Whether the content is gated for unauthorized users' })
  gated?: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Whether a subscription is required to view full content' })
  requiresSubscription?: boolean;

  @Expose()
  @ApiPropertyOptional()
  seriesId?: string;

  @Expose()
  @ApiPropertyOptional()
  featuredImage?: string;

  @Expose()
  @ApiProperty({ type: AuthorResponseDto })
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @Expose()
  @ApiPropertyOptional({ type: BlogCategoryResponseDto })
  @Type(() => BlogCategoryResponseDto)
  category?: BlogCategoryResponseDto;

  @Expose()
  @ApiPropertyOptional({ type: [BlogTagResponseDto] })
  @Type(() => BlogTagResponseDto)
  tags?: BlogTagResponseDto[];

  @Expose()
  @ApiPropertyOptional()
  publishedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  scheduledAt?: Date;

  @Expose()
  @ApiProperty()
  views: number;

  @Expose()
  @ApiPropertyOptional()
  readingTime?: number;

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
  allowComments: boolean;

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

export class PostListResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  @Type(() => PostResponseDto)
  items: PostResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
