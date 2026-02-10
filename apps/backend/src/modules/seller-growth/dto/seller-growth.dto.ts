import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InsightStatus, InsightType } from '../../../entities/seller-insight.entity';
import { GoalType, GoalStatus } from '../../../entities/seller-goal.entity';
import { ResourceType } from '../../../entities/seller-resource.entity';
import { DigitalProductType } from '../../../entities/digital-product.entity';

// ─── Insight DTOs ────────────────────────────────────────────────────────────

export class UpdateInsightStatusDto {
  @ApiProperty({ enum: InsightStatus })
  @IsEnum(InsightStatus)
  status: InsightStatus;
}

export class InsightQueryDto {
  @ApiPropertyOptional({ enum: InsightStatus })
  @IsOptional()
  @IsEnum(InsightStatus)
  status?: InsightStatus;

  @ApiPropertyOptional({ enum: InsightType })
  @IsOptional()
  @IsEnum(InsightType)
  insightType?: InsightType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ─── Goal DTOs ───────────────────────────────────────────────────────────────

export class CreateGoalDto {
  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  targetValue: number;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ example: 'Reach $5000 monthly revenue' })
  @IsOptional()
  @IsString()
  title?: string;
}

export class UpdateGoalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentValue?: number;

  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}

export class GoalQueryDto {
  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}

// ─── Resource DTOs ───────────────────────────────────────────────────────────

export class CreateResourceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;
}

export class UpdateResourceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isPublished?: boolean;
}

export class ResourceQueryDto {
  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ─── Market DTOs ─────────────────────────────────────────────────────────────

export class BenchmarkQueryDto {
  @ApiPropertyOptional({ enum: DigitalProductType })
  @IsOptional()
  @IsEnum(DigitalProductType)
  productType?: DigitalProductType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ForecastQueryDto {
  @ApiPropertyOptional({ enum: [30, 60, 90], default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  days?: 30 | 60 | 90 = 30;
}

// ─── Response Interfaces ─────────────────────────────────────────────────────

export interface PricingAnalysis {
  productId: string;
  productTitle: string;
  currentPrice: number;
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
  competitivePosition: 'underpriced' | 'competitive' | 'overpriced';
  confidenceScore: number;
}

export interface ListingScore {
  productId: string;
  overallScore: number;
  dimensions: {
    titleQuality: number;
    descriptionCompleteness: number;
    imageQuality: number;
    seoOptimization: number;
    pricingCompetitiveness: number;
    tagRelevance: number;
  };
  suggestions: Array<{
    dimension: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export interface MarketOpportunity {
  term: string;
  searchVolume: number;
  existingProducts: number;
  potential: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedProductType: string;
  reasoning: string;
}

export interface SalesForecast {
  forecastDays: number;
  projectedRevenue: number;
  projectedSales: number;
  confidenceInterval: { low: number; high: number };
  dailyProjections: Array<{ date: string; revenue: number }>;
  assumptions: string[];
}
