import { registerAs } from '@nestjs/config';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

/**
 * Security configuration validation class
 */
class SecurityConfigValidation {
  @IsString()
  ENCRYPTION_KEY: string = '';

  @IsInt()
  @Min(4)
  @Type(() => Number)
  @IsOptional()
  BCRYPT_ROUNDS?: number;

  @IsArray()
  @IsOptional()
  CORS_ORIGINS?: string[];

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  CORS_CREDENTIALS?: boolean;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  RATE_LIMIT_TTL?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  RATE_LIMIT_MAX?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  THROTTLE_TTL?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  THROTTLE_LIMIT?: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  HELMET_ENABLED?: boolean;

  @IsString()
  @IsOptional()
  CSP_DIRECTIVES?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  XSS_PROTECTION?: boolean;

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;
}

/**
 * Validates and transforms environment variables for security configuration
 * @param config - Raw environment configuration object
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function validateConfig(
  config: Record<string, unknown>,
): SecurityConfigValidation {
  const validatedConfig = plainToInstance(SecurityConfigValidation, config, {
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
      `Security configuration validation failed: ${errorMessages}`,
    );
  }

  return validatedConfig;
}

/**
 * CORS configuration interface
 */
export interface CorsConfig {
  /** Allowed origins for CORS */
  origins: string[];
  /** Whether to include credentials in CORS requests */
  credentials: boolean;
  /** Allowed HTTP methods */
  methods: string[];
  /** Allowed headers */
  allowedHeaders: string[];
  /** Headers exposed to the client */
  exposedHeaders: string[];
  /** Preflight request cache duration in seconds */
  maxAge: number;
}

/**
 * Rate limiting configuration interface
 */
export interface RateLimitConfig {
  /** Time window in seconds */
  ttl: number;
  /** Maximum requests per time window */
  max: number;
}

/**
 * Throttling configuration interface
 */
export interface ThrottleConfig {
  /** Time window in seconds */
  ttl: number;
  /** Maximum requests per time window */
  limit: number;
}

/**
 * Helmet security headers configuration
 */
export interface HelmetConfig {
  /** Whether helmet is enabled */
  enabled: boolean;
  /** Content Security Policy directives */
  cspDirectives: Record<string, string[]> | null;
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  /** AES-256 encryption key for field-level encryption */
  encryptionKey: string;
  /** Number of bcrypt/argon2 hashing rounds */
  hashRounds: number;
  /** CORS configuration */
  cors: CorsConfig;
  /** Rate limiting configuration */
  rateLimit: RateLimitConfig;
  /** Throttling configuration */
  throttle: ThrottleConfig;
  /** Helmet configuration */
  helmet: HelmetConfig;
  /** Whether XSS protection/sanitization is enabled */
  xssProtection: boolean;
  /** Sentry DSN for error tracking (optional) */
  sentryDsn?: string;
}

/**
 * Parses CSP directives from a string format
 * @param directives - String format: "directive1 value1 value2; directive2 value1"
 * @returns Parsed directives object
 */
function parseCspDirectives(
  directives?: string,
): Record<string, string[]> | null {
  if (!directives) return null;

  const result: Record<string, string[]> = {};
  const parts = directives.split(';').map((p) => p.trim());

  for (const part of parts) {
    const [directive, ...values] = part.split(' ').filter(Boolean);
    if (directive && values.length > 0) {
      result[directive] = values;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Parses CORS origins from environment variable
 * @param origins - Comma-separated origins or array
 * @returns Array of origin strings
 */
function parseCorsOrigins(origins?: string[] | string): string[] {
  if (!origins) return ['http://localhost:3000'];
  if (Array.isArray(origins)) return origins;
  return origins.split(',').map((o) => o.trim());
}

/**
 * Security configuration factory
 * Registers security-related configuration with validation
 */
export default registerAs('security', (): SecurityConfig => {
  const config = validateConfig(process.env);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    encryptionKey: config.ENCRYPTION_KEY,
    hashRounds: config.BCRYPT_ROUNDS ?? 12,
    cors: {
      origins: parseCorsOrigins(
        config.CORS_ORIGINS ?? process.env.CORS_ORIGINS,
      ),
      credentials: config.CORS_CREDENTIALS ?? true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Correlation-ID',
        'X-API-Key',
      ],
      exposedHeaders: ['X-Correlation-ID', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24 hours
    },
    rateLimit: {
      ttl: config.RATE_LIMIT_TTL ?? 60,
      max: config.RATE_LIMIT_MAX ?? (isProduction ? 100 : 1000),
    },
    throttle: {
      ttl: config.THROTTLE_TTL ?? 60,
      limit: config.THROTTLE_LIMIT ?? (isProduction ? 10 : 100),
    },
    helmet: {
      enabled: config.HELMET_ENABLED ?? true,
      cspDirectives: parseCspDirectives(config.CSP_DIRECTIVES),
    },
    xssProtection: config.XSS_PROTECTION ?? true,
    sentryDsn: config.SENTRY_DSN,
  };
});
