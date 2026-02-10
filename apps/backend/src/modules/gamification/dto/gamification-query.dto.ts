import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  AchievementCategory,
  AchievementTier,
  LeaderboardPeriod,
  LeaderboardCategory,
} from '../enums/gamification.enums';

export class AchievementsQueryDto {
  @ApiPropertyOptional({ enum: AchievementCategory })
  @IsOptional()
  @IsEnum(AchievementCategory)
  category?: AchievementCategory;

  @ApiPropertyOptional({ enum: AchievementTier })
  @IsOptional()
  @IsEnum(AchievementTier)
  tier?: AchievementTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    enum: LeaderboardPeriod,
    default: LeaderboardPeriod.WEEKLY,
  })
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod;

  @ApiPropertyOptional({
    enum: LeaderboardCategory,
    default: LeaderboardCategory.BUYER_XP,
  })
  @IsOptional()
  @IsEnum(LeaderboardCategory)
  category?: LeaderboardCategory;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ActivityQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
