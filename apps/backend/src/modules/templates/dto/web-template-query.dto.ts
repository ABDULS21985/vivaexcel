import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import {
  TemplateType,
  Framework,
  LicenseType,
  WebTemplateStatus,
} from '../../../entities/web-template.entity';

export class WebTemplateQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by title or description', example: 'dashboard' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TemplateType, description: 'Filter by template type' })
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @ApiPropertyOptional({ enum: Framework, description: 'Filter by framework' })
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;

  @ApiPropertyOptional({ enum: LicenseType, description: 'Filter by license type' })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @ApiPropertyOptional({ enum: WebTemplateStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(WebTemplateStatus)
  status?: WebTemplateStatus;

  @ApiPropertyOptional({ description: 'Minimum price', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 199.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by TypeScript support', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasTypeScript?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by features (templates must contain all specified features)',
    example: ['authentication', 'dark-mode'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  features?: string[];

  @ApiPropertyOptional({ description: 'Filter by organization ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
