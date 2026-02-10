export enum ApiKeyEnvironment {
  LIVE = 'live',
  TEST = 'test',
}

export enum ApiKeyStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

export enum ApiKeyScope {
  PRODUCTS_READ = 'products:read',
  ORDERS_READ = 'orders:read',
  ORDERS_WRITE = 'orders:write',
  ANALYTICS_READ = 'analytics:read',
  WEBHOOKS_MANAGE = 'webhooks:manage',
  CART_WRITE = 'cart:write',
  CHECKOUT_WRITE = 'checkout:write',
}
