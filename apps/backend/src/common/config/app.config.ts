import { registerAs } from '@nestjs/config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

/**
 * Application environment types
 */
export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

/**
 * Application configuration validation class
 */
class AppConfigValidation {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  APP_NAME: string = 'KTBlog';

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  APP_PORT: number = 3000;

  @IsUrl({ require_tld: false })
  @IsOptional()
  APP_URL?: string;

  @IsString()
  @IsOptional()
  APP_VERSION?: string;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;
}

/**
 * Validates and transforms environment variables for app configuration
 * @param config - Raw environment configuration object
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function validateConfig(config: Record<string, unknown>): AppConfigValidation {
  const validatedConfig = plainToInstance(AppConfigValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`App configuration validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Current environment (development, staging, production, test) */
  env: Environment;
  /** Application name */
  name: string;
  /** Server port number */
  port: number;
  /** Application base URL */
  url: string;
  /** API version string */
  version: string;
  /** API route prefix */
  apiPrefix: string;
  /** Whether the app is running in development mode */
  isDevelopment: boolean;
  /** Whether the app is running in production mode */
  isProduction: boolean;
  /** Whether the app is running in test mode */
  isTest: boolean;
}

/**
 * App configuration factory
 * Registers application-level configuration with validation
 */
export default registerAs('app', (): AppConfig => {
  const config = validateConfig(process.env);

  const env = config.NODE_ENV;

  return {
    env,
    name: config.APP_NAME,
    port: config.APP_PORT,
    url: config.APP_URL || `http://localhost:${config.APP_PORT}`,
    version: config.APP_VERSION || '1.0.0',
    apiPrefix: config.API_PREFIX || 'api/v1',
    isDevelopment: env === Environment.Development,
    isProduction: env === Environment.Production,
    isTest: env === Environment.Test,
  };
});
