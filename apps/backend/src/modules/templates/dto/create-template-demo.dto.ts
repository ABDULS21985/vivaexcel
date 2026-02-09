import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUrl,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDemoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID of the template this demo belongs to' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ example: 'Dark Mode Preview', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'https://demo.example.com/dark-mode' })
  @IsUrl()
  demoUrl: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/screenshots/dark-mode.png' })
  @IsOptional()
  @IsUrl()
  screenshotUrl?: string;

  @ApiPropertyOptional({ example: 1, description: 'Display order for the demo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
