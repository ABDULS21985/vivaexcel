import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAffiliateLinkDto {
  @ApiProperty({ description: 'Target URL for the affiliate link' })
  @IsString()
  fullUrl: string;

  @ApiPropertyOptional({ description: 'Product ID to track (null for all products)' })
  @IsOptional()
  @IsUUID()
  digitalProductId?: string;

  @ApiPropertyOptional({ description: 'Campaign name for tracking', example: 'summer-sale' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customCampaign?: string;
}
