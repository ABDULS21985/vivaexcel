import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing required API key scopes
 */
export const API_KEY_SCOPES_KEY = 'apiKeyScopes';

/**
 * Decorator to specify required API key scopes for a route.
 *
 * When applied to a controller method, the ApiKeyGuard will verify
 * that the API key has all the specified scopes.
 *
 * @example
 * ```typescript
 * @RequireScopes('products:read')
 * @Get('products')
 * listProducts() {
 *   return this.productsService.findAll();
 * }
 * ```
 *
 * @example
 * ```typescript
 * @RequireScopes('cart:write', 'checkout:write')
 * @Post('checkout')
 * createCheckout() {
 *   return this.checkoutService.create();
 * }
 * ```
 *
 * @param scopes - One or more scopes required to access the route
 * @returns MethodDecorator & ClassDecorator
 */
export const RequireScopes = (...scopes: string[]) =>
  SetMetadata(API_KEY_SCOPES_KEY, scopes);
