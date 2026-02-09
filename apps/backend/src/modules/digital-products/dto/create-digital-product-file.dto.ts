import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDigitalProductFileDto {
  @ApiProperty({ example: 'course-materials.zip' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'https://storage.example.com/files/course-materials.zip' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ example: 104857600 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'application/zip' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileType?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order?: number;
}
