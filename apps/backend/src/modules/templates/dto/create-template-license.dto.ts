import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID, Min, IsDateString } from 'class-validator';
import { TemplateLicenseType } from '../../../entities/web-template.entity';

export class CreateTemplateLicenseDto {
  @ApiProperty()
  @IsUUID()
  templateId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ enum: TemplateLicenseType })
  @IsEnum(TemplateLicenseType)
  licenseType: TemplateLicenseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxActivations?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
