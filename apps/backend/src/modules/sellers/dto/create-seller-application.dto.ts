import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSellerApplicationDto {
  @ApiProperty({ description: 'Display name for the seller profile' })
  @IsString()
  @MaxLength(100)
  displayName: string;

  @ApiPropertyOptional({ description: 'Short bio about the seller' })
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

  @ApiPropertyOptional({ description: 'Description of experience' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  experienceDescription?: string;

  @ApiPropertyOptional({ description: 'Categories of products the seller plans to create' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productCategories?: string[];

  @ApiPropertyOptional({ description: 'URLs to sample work' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  sampleWorkUrls?: string[];

  @ApiPropertyOptional({ description: 'What types of products they specialize in' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'Note about why they want to sell' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  applicationNote?: string;
}
