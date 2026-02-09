import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContentTranslation,
  TranslatableEntityType,
  SupportedLocale,
  TranslatableField,
} from './entities/content-translation.entity';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationQueryDto } from './dto/translation-query.dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../common/interfaces/response.interface';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(ContentTranslation)
    private readonly translationRepository: Repository<ContentTranslation>,
  ) {}

  /**
   * Find all translations with optional filters and pagination
   */
  async findAll(
    query: TranslationQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<ContentTranslation>>> {
    const { entityType, entityId, locale, field, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.translationRepository.createQueryBuilder('t');

    if (entityType) {
      queryBuilder.andWhere('t.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('t.entityId = :entityId', { entityId });
    }

    if (locale) {
      queryBuilder.andWhere('t.locale = :locale', { locale });
    }

    if (field) {
      queryBuilder.andWhere('t.field = :field', { field });
    }

    const [items, total] = await queryBuilder
      .orderBy('t.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      message: 'Translations retrieved successfully',
      data: {
        items,
        meta: {
          total,
          page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        total,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Find a translation by ID
   */
  async findById(id: string): Promise<ApiResponse<ContentTranslation>> {
    const translation = await this.translationRepository.findOne({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException(`Translation with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Translation retrieved successfully',
      data: translation,
    };
  }

  /**
   * Find translations for a specific entity
   */
  async findByEntity(
    entityType: TranslatableEntityType,
    entityId: string,
    locale?: SupportedLocale,
  ): Promise<ApiResponse<ContentTranslation[]>> {
    const where: Partial<ContentTranslation> = {
      entityType,
      entityId,
    };

    if (locale) {
      where.locale = locale;
    }

    const translations = await this.translationRepository.find({
      where,
      order: { field: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Translations retrieved successfully',
      data: translations,
    };
  }

  /**
   * Get a specific translation value
   */
  async getTranslationValue(
    entityType: TranslatableEntityType,
    entityId: string,
    locale: SupportedLocale,
    field: TranslatableField,
  ): Promise<string | null> {
    const translation = await this.translationRepository.findOne({
      where: {
        entityType,
        entityId,
        locale,
        field,
      },
    });

    return translation?.value ?? null;
  }

  /**
   * Get all translations for an entity as a map
   */
  async getTranslationsMap(
    entityType: TranslatableEntityType,
    entityId: string,
    locale: SupportedLocale,
  ): Promise<Record<string, string>> {
    const translations = await this.translationRepository.find({
      where: {
        entityType,
        entityId,
        locale,
      },
    });

    return translations.reduce(
      (map, t) => {
        map[t.field] = t.value;
        return map;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Create a new translation
   */
  async create(
    createTranslationDto: CreateTranslationDto,
  ): Promise<ApiResponse<ContentTranslation>> {
    // Check for existing translation with same composite key
    const existing = await this.translationRepository.findOne({
      where: {
        entityType: createTranslationDto.entityType,
        entityId: createTranslationDto.entityId,
        locale: createTranslationDto.locale,
        field: createTranslationDto.field,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Translation already exists for this entity, locale, and field combination',
      );
    }

    const translation = this.translationRepository.create(createTranslationDto);
    const saved = await this.translationRepository.save(translation);

    return {
      status: 'success',
      message: 'Translation created successfully',
      data: saved,
    };
  }

  /**
   * Create or update a translation (upsert)
   */
  async upsert(
    createTranslationDto: CreateTranslationDto,
  ): Promise<ApiResponse<ContentTranslation>> {
    const existing = await this.translationRepository.findOne({
      where: {
        entityType: createTranslationDto.entityType,
        entityId: createTranslationDto.entityId,
        locale: createTranslationDto.locale,
        field: createTranslationDto.field,
      },
    });

    if (existing) {
      existing.value = createTranslationDto.value;
      const updated = await this.translationRepository.save(existing);
      return {
        status: 'success',
        message: 'Translation updated successfully',
        data: updated,
      };
    }

    const translation = this.translationRepository.create(createTranslationDto);
    const saved = await this.translationRepository.save(translation);

    return {
      status: 'success',
      message: 'Translation created successfully',
      data: saved,
    };
  }

  /**
   * Bulk create or update translations
   */
  async bulkUpsert(
    translations: CreateTranslationDto[],
  ): Promise<ApiResponse<ContentTranslation[]>> {
    const results: ContentTranslation[] = [];

    for (const dto of translations) {
      const result = await this.upsert(dto);
      if (result.data) {
        results.push(result.data);
      }
    }

    return {
      status: 'success',
      message: `${results.length} translations processed successfully`,
      data: results,
    };
  }

  /**
   * Update an existing translation by ID
   */
  async update(
    id: string,
    updateTranslationDto: UpdateTranslationDto,
  ): Promise<ApiResponse<ContentTranslation>> {
    const translation = await this.translationRepository.findOne({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException(`Translation with ID "${id}" not found`);
    }

    // If updating composite key fields, check for conflicts
    const newEntityType = updateTranslationDto.entityType ?? translation.entityType;
    const newEntityId = updateTranslationDto.entityId ?? translation.entityId;
    const newLocale = updateTranslationDto.locale ?? translation.locale;
    const newField = updateTranslationDto.field ?? translation.field;

    if (
      newEntityType !== translation.entityType ||
      newEntityId !== translation.entityId ||
      newLocale !== translation.locale ||
      newField !== translation.field
    ) {
      const existing = await this.translationRepository.findOne({
        where: {
          entityType: newEntityType,
          entityId: newEntityId,
          locale: newLocale,
          field: newField,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Translation already exists for this entity, locale, and field combination',
        );
      }
    }

    Object.assign(translation, updateTranslationDto);
    const updated = await this.translationRepository.save(translation);

    return {
      status: 'success',
      message: 'Translation updated successfully',
      data: updated,
    };
  }

  /**
   * Delete a translation by ID
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    const translation = await this.translationRepository.findOne({
      where: { id },
    });

    if (!translation) {
      throw new NotFoundException(`Translation with ID "${id}" not found`);
    }

    await this.translationRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Translation deleted successfully',
      data: null,
    };
  }

  /**
   * Delete all translations for an entity
   */
  async removeByEntity(
    entityType: TranslatableEntityType,
    entityId: string,
  ): Promise<ApiResponse<{ deleted: number }>> {
    const result = await this.translationRepository.softDelete({
      entityType,
      entityId,
    });

    return {
      status: 'success',
      message: `Translations deleted successfully`,
      data: { deleted: result.affected ?? 0 },
    };
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): ApiResponse<SupportedLocale[]> {
    return {
      status: 'success',
      message: 'Supported locales retrieved successfully',
      data: Object.values(SupportedLocale),
    };
  }

  /**
   * Get translatable entity types
   */
  getTranslatableEntityTypes(): ApiResponse<TranslatableEntityType[]> {
    return {
      status: 'success',
      message: 'Translatable entity types retrieved successfully',
      data: Object.values(TranslatableEntityType),
    };
  }

  /**
   * Get translatable fields
   */
  getTranslatableFields(): ApiResponse<TranslatableField[]> {
    return {
      status: 'success',
      message: 'Translatable fields retrieved successfully',
      data: Object.values(TranslatableField),
    };
  }
}
