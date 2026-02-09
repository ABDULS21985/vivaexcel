import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import {
  TranslatableEntityType,
  SupportedLocale,
  TranslatableField,
} from '../entities/content-translation.entity';

/**
 * DTO for updating an existing content translation
 */
export class UpdateTranslationDto {
  @ApiPropertyOptional({
    description: 'Type of entity being translated',
    enum: TranslatableEntityType,
    example: TranslatableEntityType.PRODUCT,
  })
  @IsOptional()
  @IsEnum(TranslatableEntityType)
  entityType?: TranslatableEntityType;

  @ApiPropertyOptional({
    description: 'UUID of the entity being translated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Locale for the translation',
    enum: SupportedLocale,
    example: SupportedLocale.FR,
  })
  @IsOptional()
  @IsEnum(SupportedLocale)
  locale?: SupportedLocale;

  @ApiPropertyOptional({
    description: 'Field being translated',
    enum: TranslatableField,
    example: TranslatableField.NAME,
  })
  @IsOptional()
  @IsEnum(TranslatableField)
  field?: TranslatableField;

  @ApiPropertyOptional({
    description: 'Translated value',
    example: 'Nom du produit en francais',
  })
  @IsOptional()
  @IsString()
  @MaxLength(65535)
  value?: string;
}
