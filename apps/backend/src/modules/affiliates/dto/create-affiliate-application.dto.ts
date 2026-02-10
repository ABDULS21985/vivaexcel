import { IsString, IsOptional, IsArray, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffiliateApplicationDto {
  @ApiPropertyOptional({ description: 'Custom slug for vanity URL' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customSlug?: string;

  @ApiPropertyOptional({ description: 'Bio describing how you plan to promote' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Your website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ description: 'How you plan to promote', example: ['Blog', 'YouTube', 'Twitter'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  promotionMethods?: string[];

  @ApiPropertyOptional({ description: 'Application note' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  applicationNote?: string;
}
