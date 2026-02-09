import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';

export class CatalogServiceQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by name, slug, or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tower ID' })
  @IsOptional()
  @IsUUID()
  towerId?: string;

  @ApiPropertyOptional({ description: 'Filter by tower slug' })
  @IsOptional()
  @IsString()
  towerSlug?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by featured status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by industry tag' })
  @IsOptional()
  @IsString()
  industryTag?: string;
}
