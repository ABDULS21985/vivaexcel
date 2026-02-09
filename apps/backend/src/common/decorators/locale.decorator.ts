import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LocalizedRequest } from '../interceptors/i18n.interceptor';
import { SupportedLocale } from '../../modules/translations/entities/content-translation.entity';

/**
 * Default locale when not set on request
 */
const DEFAULT_LOCALE = SupportedLocale.EN;

/**
 * Parameter decorator to extract the locale from the request
 *
 * The locale is set by the I18nInterceptor based on the Accept-Language header.
 *
 * @example
 * ```typescript
 * @Get('products')
 * getProducts(@Locale() locale: SupportedLocale) {
 *   return this.productService.findAll(locale);
 * }
 * ```
 *
 * @returns The resolved locale from the request
 */
export const Locale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupportedLocale => {
    const request = ctx.switchToHttp().getRequest<LocalizedRequest>();
    return request.locale ?? DEFAULT_LOCALE;
  },
);

/**
 * Parameter decorator to get the raw Accept-Language header value
 *
 * @example
 * ```typescript
 * @Get('negotiate')
 * negotiate(@AcceptLanguage() acceptLanguage: string) {
 *   console.log('Raw header:', acceptLanguage);
 * }
 * ```
 *
 * @returns The raw Accept-Language header value or undefined
 */
export const AcceptLanguage = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LocalizedRequest>();
    return request.headers['accept-language'];
  },
);
