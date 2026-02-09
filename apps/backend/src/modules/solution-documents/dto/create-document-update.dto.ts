import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateDocumentUpdateDto {
  @ApiProperty({ description: 'Solution document ID this update belongs to' })
  @IsUUID()
  documentId: string;

  @ApiProperty({ description: 'Version number', example: '1.1' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Release notes describing what changed' })
  @IsString()
  releaseNotes: string;

  @ApiPropertyOptional({ description: 'ID of the associated file' })
  @IsOptional()
  @IsString()
  fileId?: string;
}
