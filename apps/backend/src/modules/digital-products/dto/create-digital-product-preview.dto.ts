import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DigitalProductPreviewType } from '../../../entities/digital-product-preview.entity';

export class CreateDigitalProductPreviewDto {
  @ApiProperty({
    enum: DigitalProductPreviewType,
    example: DigitalProductPreviewType.IMAGE,
  })
  @IsEnum(DigitalProductPreviewType)
  type: DigitalProductPreviewType;

  @ApiProperty({ example: 'https://example.com/preview.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
