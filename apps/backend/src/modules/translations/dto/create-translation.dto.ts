import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import {
  TranslatableEntityType,
  SupportedLocale,
  TranslatableField,
} from '../entities/content-translation.entity';

/**
 * DTO for creating a new content translation
 */
export class CreateTranslationDto {
  @ApiProperty({
    description: 'Type of entity being translated',
    enum: TranslatableEntityType,
    example: TranslatableEntityType.PRODUCT,
  })
  @IsEnum(TranslatableEntityType)
  entityType: TranslatableEntityType;

  @ApiProperty({
    description: 'UUID of the entity being translated',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  entityId: string;

  @ApiProperty({
    description: 'Locale for the translation',
    enum: SupportedLocale,
    example: SupportedLocale.FR,
  })
  @IsEnum(SupportedLocale)
  locale: SupportedLocale;

  @ApiProperty({
    description: 'Field being translated',
    enum: TranslatableField,
    example: TranslatableField.NAME,
  })
  @IsEnum(TranslatableField)
  field: TranslatableField;

  @ApiProperty({
    description: 'Translated value',
    example: 'Nom du produit en francais',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(65535)
  value: string;
}
