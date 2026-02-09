import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '../enums/solution-document.enums';

export class CreateDocumentBundleDto {
  @ApiProperty({ description: 'Bundle name', example: 'Cloud Migration Starter Pack' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'cloud-migration-starter-pack' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ description: 'Bundle description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Bundle price', example: 99.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bundlePrice: number;

  @ApiProperty({
    description: 'IDs of solution documents to include in the bundle',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds: string[];

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    enum: DocumentStatus,
    description: 'Bundle status',
    example: DocumentStatus.DRAFT,
    default: DocumentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
