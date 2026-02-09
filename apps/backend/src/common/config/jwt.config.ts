import { registerAs } from '@nestjs/config';
import { IsInt, IsString, Min, validateSync } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

/**
 * JWT configuration validation class
 */
class JwtConfigValidation {
  @IsString()
  JWT_ACCESS_SECRET: string = '';

  @IsString()
  JWT_REFRESH_SECRET: string = '';

  @IsInt()
  @Min(60)
  @Type(() => Number)
  JWT_ACCESS_EXPIRES_IN: number = 900; // 15 minutes in seconds

  @IsInt()
  @Min(3600)
  @Type(() => Number)
  JWT_REFRESH_EXPIRES_IN: number = 604800; // 7 days in seconds

  @IsString()
  JWT_ISSUER: string = 'digiweb';

  @IsString()
  JWT_AUDIENCE: string = 'digiweb-api';
}

/**
 * Validates and transforms environment variables for JWT configuration
 * @param config - Raw environment configuration object
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function validateConfig(config: Record<string, unknown>): JwtConfigValidation {
  const validatedConfig = plainToInstance(JwtConfigValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`JWT configuration validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}

/**
 * Access token configuration
 */
export interface AccessTokenConfig {
  /** Secret key for signing access tokens */
  secret: string;
  /** Token expiration time in seconds (default: 900 = 15 minutes) */
  expiresIn: number;
  /** Human-readable expiration string */
  expiresInString: string;
}

/**
 * Refresh token configuration
 */
export interface RefreshTokenConfig {
  /** Secret key for signing refresh tokens */
  secret: string;
  /** Token expiration time in seconds (default: 604800 = 7 days) */
  expiresIn: number;
  /** Human-readable expiration string */
  expiresInString: string;
}

/**
 * JWT configuration interface
 */
export interface JwtConfig {
  /** Access token configuration */
  access: AccessTokenConfig;
  /** Refresh token configuration */
  refresh: RefreshTokenConfig;
  /** Token issuer identifier */
  issuer: string;
  /** Token audience identifier */
  audience: string;
}

/**
 * Converts seconds to a human-readable duration string
 * @param seconds - Duration in seconds
 * @returns Human-readable string (e.g., "15m", "7d")
 */
function formatDuration(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days}d`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * JWT configuration factory
 * Registers JWT authentication configuration with validation
 */
export default registerAs('jwt', (): JwtConfig => {
  const config = validateConfig(process.env);

  return {
    access: {
      secret: config.JWT_ACCESS_SECRET,
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
      expiresInString: formatDuration(config.JWT_ACCESS_EXPIRES_IN),
    },
    refresh: {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
      expiresInString: formatDuration(config.JWT_REFRESH_EXPIRES_IN),
    },
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
  };
});
