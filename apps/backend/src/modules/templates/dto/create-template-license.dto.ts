import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseType } from '../../../entities/web-template.enums';

export class CreateTemplateLicenseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID of the template' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID of the user' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID of the associated order' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ enum: LicenseType, example: LicenseType.SINGLE_USE })
  @IsEnum(LicenseType)
  licenseType: LicenseType;

  @ApiPropertyOptional({ example: 1, description: 'Maximum number of activations allowed', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxActivations?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z', description: 'License expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
