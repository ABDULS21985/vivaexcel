import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

/**
 * Supported entity types for translations
 */
export enum TranslatableEntityType {
  PRODUCT = 'product',
  SERVICE = 'service',
  BLOG_POST = 'blog_post',
}

/**
 * Supported locales for translations
 */
export enum SupportedLocale {
  EN = 'en',
  AR = 'ar',
  FR = 'fr',
  ES = 'es',
  PT = 'pt',
}

/**
 * Translatable field types
 */
export enum TranslatableField {
  NAME = 'name',
  DESCRIPTION = 'description',
  CONTENT = 'content',
}

/**
 * Content Translation Entity
 * Stores translations for various entity types and fields
 */
@Entity('content_translations')
@Unique(['entityType', 'entityId', 'locale', 'field'])
@Index(['entityType', 'entityId'])
@Index(['locale'])
export class ContentTranslation extends BaseEntity {
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: TranslatableEntityType,
  })
  entityType: TranslatableEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId: string;

  @Column({
    type: 'enum',
    enum: SupportedLocale,
  })
  locale: SupportedLocale;

  @Column({
    type: 'enum',
    enum: TranslatableField,
  })
  field: TranslatableField;

  @Column({ type: 'text' })
  value: string;
}
