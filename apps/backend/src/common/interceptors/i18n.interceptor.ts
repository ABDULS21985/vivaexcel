import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { TranslationsService } from '../../modules/translations/translations.service';
import {
  SupportedLocale,
  TranslatableEntityType,
  TranslatableField,
} from '../../modules/translations/entities/content-translation.entity';

/**
 * Extended Request interface with locale
 */
export interface LocalizedRequest extends Request {
  locale: SupportedLocale;
}

/**
 * Default locale when Accept-Language header is not provided or invalid
 */
const DEFAULT_LOCALE = SupportedLocale.EN;

/**
 * Supported locales array for validation
 */
const SUPPORTED_LOCALES = Object.values(SupportedLocale);

/**
 * Entity type to translatable fields mapping
 */
const ENTITY_TRANSLATABLE_FIELDS: Record<string, TranslatableField[]> = {
  product: [
    TranslatableField.NAME,
    TranslatableField.DESCRIPTION,
    TranslatableField.CONTENT,
  ],
  service: [
    TranslatableField.NAME,
    TranslatableField.DESCRIPTION,
    TranslatableField.CONTENT,
  ],
  blog_post: [
    TranslatableField.NAME,
    TranslatableField.DESCRIPTION,
    TranslatableField.CONTENT,
  ],
  post: [
    TranslatableField.NAME,
    TranslatableField.DESCRIPTION,
    TranslatableField.CONTENT,
  ],
};

/**
 * Parse Accept-Language header and return the best matching locale
 * Supports formats like: "en", "en-US", "en-US,fr;q=0.9,ar;q=0.8"
 */
function parseAcceptLanguage(acceptLanguage: string | undefined): SupportedLocale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse the Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      const quality = qValue ? parseFloat(qValue) : 1.0;
      // Extract just the language code (e.g., "en" from "en-US")
      const langCode = code.split('-')[0].toLowerCase();
      return { code: langCode, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first supported locale
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang.code as SupportedLocale)) {
      return lang.code as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Check if an object has entity-like properties that can be translated
 */
function isTranslatableEntity(obj: unknown): obj is Record<string, unknown> & { id: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
}

/**
 * Determine entity type from object or context
 */
function getEntityType(obj: Record<string, unknown>, path: string): TranslatableEntityType | null {
  // Check for explicit entityType property
  if (obj.entityType && typeof obj.entityType === 'string') {
    return obj.entityType as TranslatableEntityType;
  }

  // Infer from URL path
  if (path.includes('/products')) {
    return TranslatableEntityType.PRODUCT;
  }
  if (path.includes('/services')) {
    return TranslatableEntityType.SERVICE;
  }
  if (path.includes('/blog') || path.includes('/posts')) {
    return TranslatableEntityType.BLOG_POST;
  }

  return null;
}

/**
 * I18n Interceptor
 *
 * This interceptor handles internationalization by:
 * 1. Reading the Accept-Language header from the request
 * 2. Attaching the resolved locale to the request object
 * 3. Transforming response content by applying translations based on locale
 *
 * Usage:
 * - Apply globally in main.ts or at controller/method level
 * - Access locale in controllers via request.locale
 *
 * @example
 * ```typescript
 * // Global usage in main.ts
 * app.useGlobalInterceptors(new I18nInterceptor(translationsService));
 *
 * // Access locale in controller
 * @Get()
 * async getProducts(@Req() request: LocalizedRequest) {
 *   console.log(request.locale); // 'en', 'ar', 'fr', etc.
 * }
 * ```
 */
@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(TranslationsService)
    private readonly translationsService?: TranslationsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<LocalizedRequest>();

    // Parse Accept-Language header and attach locale to request
    const acceptLanguage = request.headers['accept-language'];
    request.locale = parseAcceptLanguage(acceptLanguage);

    // If no translations service or locale is default English, skip transformation
    if (!this.translationsService || request.locale === SupportedLocale.EN) {
      return next.handle();
    }

    const locale = request.locale;
    const path = request.url;

    return next.handle().pipe(
      map(async (data) => {
        // Transform the response data with translations
        return this.transformResponse(data, locale, path);
      }),
      // Unwrap the promise
      map((promise) => promise),
    );
  }

  /**
   * Transform response data by applying translations
   */
  private async transformResponse(
    data: unknown,
    locale: SupportedLocale,
    path: string,
  ): Promise<unknown> {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle standard API response format
    if (this.isApiResponse(data)) {
      const responseData = (data as Record<string, unknown>).data;
      if (responseData) {
        (data as Record<string, unknown>).data = await this.transformData(
          responseData,
          locale,
          path,
        );
      }
      return data;
    }

    return this.transformData(data, locale, path);
  }

  /**
   * Check if data is a standard API response
   */
  private isApiResponse(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const response = data as Record<string, unknown>;
    return (
      'status' in response &&
      (response.status === 'success' || response.status === 'error')
    );
  }

  /**
   * Transform data (array or single entity)
   */
  private async transformData(
    data: unknown,
    locale: SupportedLocale,
    path: string,
  ): Promise<unknown> {
    // Handle arrays
    if (Array.isArray(data)) {
      return Promise.all(
        data.map((item) => this.transformEntity(item, locale, path)),
      );
    }

    // Handle paginated responses with items array
    if (
      typeof data === 'object' &&
      data !== null &&
      'items' in data &&
      Array.isArray((data as Record<string, unknown>).items)
    ) {
      const paginatedData = data as Record<string, unknown>;
      paginatedData.items = await Promise.all(
        (paginatedData.items as unknown[]).map((item) =>
          this.transformEntity(item, locale, path),
        ),
      );
      return paginatedData;
    }

    // Handle single entity
    return this.transformEntity(data, locale, path);
  }

  /**
   * Transform a single entity by applying translations
   */
  private async transformEntity(
    entity: unknown,
    locale: SupportedLocale,
    path: string,
  ): Promise<unknown> {
    if (!isTranslatableEntity(entity)) {
      return entity;
    }

    const entityType = getEntityType(entity, path);
    if (!entityType || !this.translationsService) {
      return entity;
    }

    try {
      // Get translations for this entity
      const translations = await this.translationsService.getTranslationsMap(
        entityType,
        entity.id,
        locale,
      );

      // Apply translations to the entity
      const translatableFields = ENTITY_TRANSLATABLE_FIELDS[entityType] || [];

      for (const field of translatableFields) {
        if (translations[field] && field in entity) {
          (entity as Record<string, unknown>)[field] = translations[field];
        }
      }

      // Add locale metadata
      (entity as Record<string, unknown>)._locale = locale;
    } catch {
      // If translation lookup fails, return original entity
    }

    return entity;
  }
}

/**
 * Decorator to extract locale from request
 * Usage: @Locale() locale: SupportedLocale
 */
export function getLocaleFromRequest(request: LocalizedRequest): SupportedLocale {
  return request.locale || DEFAULT_LOCALE;
}
