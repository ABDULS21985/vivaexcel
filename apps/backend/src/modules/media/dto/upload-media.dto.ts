import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength, IsArray } from 'class-validator';

export class UploadMediaDto {
  @ApiPropertyOptional({ example: 'Product Image' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'A product image showing the item from the front' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @ApiPropertyOptional({ example: 'Detailed description of the media file' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ type: [String], example: ['product', 'featured'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'Product Image' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'A product image showing the item from the front' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @ApiPropertyOptional({ example: 'Detailed description of the media file' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'uuid-of-folder' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
