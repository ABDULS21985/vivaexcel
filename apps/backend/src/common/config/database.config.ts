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
 * Database configuration validation class
 */
class DatabaseConfigValidation {
  @IsString()
  DB_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  DB_PORT: number = 5433;

  @IsString()
  DB_USERNAME: string = 'ktblog';

  @IsString()
  DB_PASSWORD: string = '';

  @IsString()
  DB_NAME: string = 'ktblog';

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  DB_SYNCHRONIZE?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  DB_LOGGING?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  DB_SSL?: boolean;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  DB_POOL_SIZE?: number;

  @IsInt()
  @Min(1000)
  @Type(() => Number)
  @IsOptional()
  DB_CONNECTION_TIMEOUT?: number;

  @IsInt()
  @Min(1000)
  @Type(() => Number)
  @IsOptional()
  DB_IDLE_TIMEOUT?: number;
}

/**
 * Validates and transforms environment variables for database configuration
 * @param config - Raw environment configuration object
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function validateConfig(
  config: Record<string, unknown>,
): DatabaseConfigValidation {
  const validatedConfig = plainToInstance(DatabaseConfigValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(
      `Database configuration validation failed: ${errorMessages}`,
    );
  }

  return validatedConfig;
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /** Database host address */
  host: string;
  /** Database port number */
  port: number;
  /** Database username */
  username: string;
  /** Database password */
  password: string;
  /** Database name */
  database: string;
  /** Whether to auto-synchronize schema (disable in production) */
  synchronize: boolean;
  /** Whether to enable query logging */
  logging: boolean;
  /** Whether to use SSL connection */
  ssl: boolean;
  /** Connection pool size */
  poolSize: number;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Idle connection timeout in milliseconds */
  idleTimeout: number;
}

/**
 * Database configuration factory
 * Registers PostgreSQL database configuration with validation
 */
export default registerAs('database', (): DatabaseConfig => {
  const config = validateConfig(process.env);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    synchronize: config.DB_SYNCHRONIZE ?? !isProduction,
    logging: config.DB_LOGGING ?? !isProduction,
    ssl: config.DB_SSL ?? isProduction,
    poolSize: config.DB_POOL_SIZE ?? 10,
    connectionTimeout: config.DB_CONNECTION_TIMEOUT ?? 10000,
    idleTimeout: config.DB_IDLE_TIMEOUT ?? 30000,
  };
});
