import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributorApplicationDto {
  @ApiProperty({ description: 'Display name for your contributor profile' })
  @IsString()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({ description: 'Short bio about yourself' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Personal or business website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Portfolio URLs showcasing previous work' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  portfolioUrls?: string[];

  @ApiPropertyOptional({ description: 'Description of your experience' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  experienceDescription?: string;

  @ApiPropertyOptional({ description: 'Types of content you plan to create' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentCategories?: string[];

  @ApiPropertyOptional({ description: 'URLs to sample work' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  sampleWorkUrls?: string[];

  @ApiPropertyOptional({ description: 'Your areas of expertise' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Why you want to contribute' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  applicationNote?: string;
}
