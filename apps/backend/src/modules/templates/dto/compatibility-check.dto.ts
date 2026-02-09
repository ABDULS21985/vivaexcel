import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsArray,
} from 'class-validator';
import {
  Framework,
  TemplateType,
  PackageManager,
} from '../../../entities/web-template.entity';

export class CompatibilityCheckDto {
  @ApiProperty({ enum: Framework })
  @IsEnum(Framework)
  framework: Framework;

  @ApiPropertyOptional({ enum: TemplateType })
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nodeVersion?: string;

  @ApiPropertyOptional({ enum: PackageManager })
  @IsOptional()
  @IsEnum(PackageManager)
  packageManager?: PackageManager;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTypeScript?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFeatures?: string[];
}
