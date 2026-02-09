import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import {
  DocumentType,
  Domain,
  MaturityLevel,
} from '../enums/solution-document.enums';

export class SolutionDocumentQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DocumentType, description: 'Filter by document type' })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ enum: Domain, description: 'Filter by domain' })
  @IsOptional()
  @IsEnum(Domain)
  domain?: Domain;

  @ApiPropertyOptional({ description: 'Filter by cloud platform (JSONB contains)' })
  @IsOptional()
  @IsString()
  cloudPlatform?: string;

  @ApiPropertyOptional({ description: 'Filter by compliance framework (JSONB contains)' })
  @IsOptional()
  @IsString()
  complianceFramework?: string;

  @ApiPropertyOptional({ enum: MaturityLevel, description: 'Filter by maturity level' })
  @IsOptional()
  @IsEnum(MaturityLevel)
  maturityLevel?: MaturityLevel;

  @ApiPropertyOptional({ description: 'Filter by template format (JSONB contains)', example: 'DOCX' })
  @IsOptional()
  @IsString()
  templateFormat?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by editable diagrams availability' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasEditableDiagrams?: boolean;

  @ApiPropertyOptional({ description: 'Filter by featured documents' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Minimum page count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minPageCount?: number;

  @ApiPropertyOptional({ description: 'Maximum page count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(10000)
  maxPageCount?: number;

  @ApiPropertyOptional({ description: 'Filter by technology (JSONB contains)' })
  @IsOptional()
  @IsString()
  technology?: string;
}
