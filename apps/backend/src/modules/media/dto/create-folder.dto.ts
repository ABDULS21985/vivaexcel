import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFolderDto {
  @ApiProperty({ example: 'Product Images' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'product-images' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'Folder for storing product images' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-folder' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order?: number;
}
