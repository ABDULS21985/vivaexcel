import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

/**
 * Redis configuration validation class
 */
class RedisConfigValidation {
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsInt()
  @Min(0)
  @Max(15)
  @Type(() => Number)
  @IsOptional()
  REDIS_DB?: number;

  @IsString()
  @IsOptional()
  REDIS_KEY_PREFIX?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  REDIS_TLS?: boolean;

  @IsInt()
  @Min(1000)
  @Type(() => Number)
  @IsOptional()
  REDIS_CONNECT_TIMEOUT?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  @IsOptional()
  REDIS_MAX_RETRIES?: number;

  @IsInt()
  @Min(100)
  @Type(() => Number)
  @IsOptional()
  REDIS_RETRY_DELAY?: number;
}

/**
 * Validates and transforms environment variables for Redis configuration
 * @param config - Raw environment configuration object
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function validateConfig(
  config: Record<string, unknown>,
): RedisConfigValidation {
  const validatedConfig = plainToInstance(RedisConfigValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Redis configuration validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}

/**
 * Redis configuration interface
 */
export interface RedisConfig {
  /** Redis host address */
  host: string;
  /** Redis port number */
  port: number;
  /** Redis password (optional) */
  password?: string;
  /** Redis database index (0-15) */
  db: number;
  /** Key prefix for all Redis keys */
  keyPrefix: string;
  /** Whether to use TLS connection */
  tls: boolean;
  /** Connection timeout in milliseconds */
  connectTimeout: number;
  /** Maximum number of connection retries */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
}

/**
 * Redis configuration factory
 * Registers Redis cache/session configuration with validation
 */
export default registerAs('redis', (): RedisConfig => {
  const config = validateConfig(process.env);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB ?? 0,
    keyPrefix: config.REDIS_KEY_PREFIX ?? 'digiweb:',
    tls: config.REDIS_TLS ?? isProduction,
    connectTimeout: config.REDIS_CONNECT_TIMEOUT ?? 10000,
    maxRetries: config.REDIS_MAX_RETRIES ?? 3,
    retryDelay: config.REDIS_RETRY_DELAY ?? 1000,
  };
});
