export { default as appConfig } from './app.config';
export type { AppConfig, Environment } from './app.config';

export { default as databaseConfig } from './database.config';
export type { DatabaseConfig } from './database.config';

export { default as redisConfig } from './redis.config';
export type { RedisConfig } from './redis.config';

export { default as jwtConfig } from './jwt.config';
export type { JwtConfig, AccessTokenConfig, RefreshTokenConfig } from './jwt.config';

export { default as securityConfig } from './security.config';
export type {
  SecurityConfig,
  CorsConfig,
  RateLimitConfig,
  ThrottleConfig,
  HelmetConfig,
} from './security.config';

/**
 * All configuration modules for use with ConfigModule.forRoot()
 */
export const configModules = [
  require('./app.config').default,
  require('./database.config').default,
  require('./redis.config').default,
  require('./jwt.config').default,
  require('./security.config').default,
];
