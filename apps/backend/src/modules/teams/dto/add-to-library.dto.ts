import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class AddToLibraryDto {
  @ApiProperty({ example: 'uuid-of-digital-product' })
  @IsUUID()
  digitalProductId: string;

  @ApiPropertyOptional({ example: 'uuid-of-license' })
  @IsOptional()
  @IsUUID()
  licenseId?: string;

  @ApiPropertyOptional({ example: 'Great template for client presentations' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], example: ['presentation', 'client-facing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
