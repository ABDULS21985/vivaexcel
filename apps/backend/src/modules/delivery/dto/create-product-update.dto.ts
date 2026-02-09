import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateProductUpdateDto {
  @ApiProperty({ description: 'Version identifier (e.g. 1.2.0)' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'Release notes or changelog in markdown' })
  @IsString()
  @IsNotEmpty()
  releaseNotes: string;

  @ApiPropertyOptional({ description: 'ID of the updated file resource' })
  @IsOptional()
  @IsUUID()
  fileId?: string;

  @ApiPropertyOptional({ description: 'Whether this is a breaking change', default: false })
  @IsOptional()
  @IsBoolean()
  isBreaking?: boolean;
}
