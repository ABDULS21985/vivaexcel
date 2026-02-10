import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DigitalProductPreviewType } from '../../../entities/digital-product-preview.entity';

export class PreviewQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by preview type',
    enum: DigitalProductPreviewType,
  })
  @IsOptional()
  @IsEnum(DigitalProductPreviewType)
  type?: DigitalProductPreviewType;

  @ApiPropertyOptional({
    description: 'Maximum number of previews to return',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of previews to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
