/**
 * Authentication error codes (AUTH_*)
 * Used for authentication and authorization failures
 */
export enum AuthErrorCode {
  /** Invalid credentials provided */
  INVALID_CREDENTIALS = 'AUTH_001',
  /** Access token is invalid or malformed */
  INVALID_TOKEN = 'AUTH_002',
  /** Access token has expired */
  TOKEN_EXPIRED = 'AUTH_003',
  /** Refresh token is invalid or malformed */
  INVALID_REFRESH_TOKEN = 'AUTH_004',
  /** Refresh token has expired */
  REFRESH_TOKEN_EXPIRED = 'AUTH_005',
  /** User account is not active */
  ACCOUNT_INACTIVE = 'AUTH_006',
  /** User account is locked */
  ACCOUNT_LOCKED = 'AUTH_007',
  /** User account is suspended */
  ACCOUNT_SUSPENDED = 'AUTH_008',
  /** Email not verified */
  EMAIL_NOT_VERIFIED = 'AUTH_009',
  /** Two-factor authentication required */
  TWO_FACTOR_REQUIRED = 'AUTH_010',
  /** Invalid two-factor code */
  INVALID_TWO_FACTOR_CODE = 'AUTH_011',
  /** Session expired */
  SESSION_EXPIRED = 'AUTH_012',
  /** Session not found */
  SESSION_NOT_FOUND = 'AUTH_013',
  /** Password reset token invalid */
  INVALID_RESET_TOKEN = 'AUTH_014',
  /** Password reset token expired */
  RESET_TOKEN_EXPIRED = 'AUTH_015',
  /** OAuth provider error */
  OAUTH_ERROR = 'AUTH_016',
  /** OAuth account not linked */
  OAUTH_NOT_LINKED = 'AUTH_017',
  /** Insufficient permissions */
  INSUFFICIENT_PERMISSIONS = 'AUTH_018',
  /** Role not allowed */
  ROLE_NOT_ALLOWED = 'AUTH_019',
  /** API key invalid */
  INVALID_API_KEY = 'AUTH_020',
}

/**
 * Validation error codes (VAL_*)
 * Used for input validation failures
 */
export enum ValidationErrorCode {
  /** Generic validation error */
  VALIDATION_FAILED = 'VAL_001',
  /** Required field is missing */
  REQUIRED_FIELD = 'VAL_002',
  /** Field value is invalid */
  INVALID_VALUE = 'VAL_003',
  /** Field format is invalid */
  INVALID_FORMAT = 'VAL_004',
  /** Field value is too short */
  TOO_SHORT = 'VAL_005',
  /** Field value is too long */
  TOO_LONG = 'VAL_006',
  /** Field value is below minimum */
  BELOW_MINIMUM = 'VAL_007',
  /** Field value is above maximum */
  ABOVE_MAXIMUM = 'VAL_008',
  /** Invalid email format */
  INVALID_EMAIL = 'VAL_009',
  /** Invalid password format */
  INVALID_PASSWORD = 'VAL_010',
  /** Password too weak */
  WEAK_PASSWORD = 'VAL_011',
  /** Invalid phone number */
  INVALID_PHONE = 'VAL_012',
  /** Invalid URL format */
  INVALID_URL = 'VAL_013',
  /** Invalid UUID format */
  INVALID_UUID = 'VAL_014',
  /** Invalid date format */
  INVALID_DATE = 'VAL_015',
  /** Invalid enum value */
  INVALID_ENUM = 'VAL_016',
  /** Invalid JSON format */
  INVALID_JSON = 'VAL_017',
  /** Array is empty */
  EMPTY_ARRAY = 'VAL_018',
  /** Array has too many items */
  ARRAY_TOO_LONG = 'VAL_019',
  /** Duplicate value */
  DUPLICATE_VALUE = 'VAL_020',
}

/**
 * Resource error codes (RES_*)
 * Used for resource-related failures
 */
export enum ResourceErrorCode {
  /** Resource not found */
  NOT_FOUND = 'RES_001',
  /** Resource already exists */
  ALREADY_EXISTS = 'RES_002',
  /** Resource conflict */
  CONFLICT = 'RES_003',
  /** Resource deleted */
  DELETED = 'RES_004',
  /** Resource archived */
  ARCHIVED = 'RES_005',
  /** Resource locked */
  LOCKED = 'RES_006',
  /** Resource expired */
  EXPIRED = 'RES_007',
  /** Resource limit exceeded */
  LIMIT_EXCEEDED = 'RES_008',
  /** Resource quota exceeded */
  QUOTA_EXCEEDED = 'RES_009',
  /** Resource in use */
  IN_USE = 'RES_010',
  /** Resource not available */
  NOT_AVAILABLE = 'RES_011',
  /** Resource pending approval */
  PENDING_APPROVAL = 'RES_012',
  /** Resource rejected */
  REJECTED = 'RES_013',
  /** Invalid resource state */
  INVALID_STATE = 'RES_014',
  /** Resource dependency error */
  DEPENDENCY_ERROR = 'RES_015',
}

/**
 * Database error codes (DB_*)
 * Used for database operation failures
 */
export enum DatabaseErrorCode {
  /** Generic database error */
  DATABASE_ERROR = 'DB_001',
  /** Connection failed */
  CONNECTION_FAILED = 'DB_002',
  /** Query failed */
  QUERY_FAILED = 'DB_003',
  /** Transaction failed */
  TRANSACTION_FAILED = 'DB_004',
  /** Constraint violation */
  CONSTRAINT_VIOLATION = 'DB_005',
  /** Foreign key violation */
  FOREIGN_KEY_VIOLATION = 'DB_006',
  /** Unique constraint violation */
  UNIQUE_VIOLATION = 'DB_007',
  /** Deadlock detected */
  DEADLOCK = 'DB_008',
  /** Timeout */
  TIMEOUT = 'DB_009',
  /** Record not found */
  RECORD_NOT_FOUND = 'DB_010',
  /** Migration failed */
  MIGRATION_FAILED = 'DB_011',
  /** Seed failed */
  SEED_FAILED = 'DB_012',
}

/**
 * File/Upload error codes (FILE_*)
 * Used for file handling failures
 */
export enum FileErrorCode {
  /** Upload failed */
  UPLOAD_FAILED = 'FILE_001',
  /** File too large */
  FILE_TOO_LARGE = 'FILE_002',
  /** Invalid file type */
  INVALID_TYPE = 'FILE_003',
  /** File not found */
  NOT_FOUND = 'FILE_004',
  /** File corrupted */
  CORRUPTED = 'FILE_005',
  /** Storage limit exceeded */
  STORAGE_LIMIT = 'FILE_006',
  /** Download failed */
  DOWNLOAD_FAILED = 'FILE_007',
  /** Delete failed */
  DELETE_FAILED = 'FILE_008',
  /** Invalid file name */
  INVALID_NAME = 'FILE_009',
  /** File processing failed */
  PROCESSING_FAILED = 'FILE_010',
}

/**
 * External service error codes (EXT_*)
 * Used for external service failures
 */
export enum ExternalErrorCode {
  /** External service unavailable */
  SERVICE_UNAVAILABLE = 'EXT_001',
  /** External API error */
  API_ERROR = 'EXT_002',
  /** External timeout */
  TIMEOUT = 'EXT_003',
  /** Rate limited by external service */
  RATE_LIMITED = 'EXT_004',
  /** External authentication failed */
  AUTH_FAILED = 'EXT_005',
  /** Invalid external response */
  INVALID_RESPONSE = 'EXT_006',
  /** External webhook failed */
  WEBHOOK_FAILED = 'EXT_007',
  /** Email service error */
  EMAIL_ERROR = 'EXT_008',
  /** SMS service error */
  SMS_ERROR = 'EXT_009',
  /** Payment service error */
  PAYMENT_ERROR = 'EXT_010',
}

/**
 * Rate limiting error codes (RATE_*)
 * Used for rate limiting failures
 */
export enum RateLimitErrorCode {
  /** Too many requests */
  TOO_MANY_REQUESTS = 'RATE_001',
  /** Login attempts exceeded */
  LOGIN_ATTEMPTS_EXCEEDED = 'RATE_002',
  /** API rate limit exceeded */
  API_LIMIT_EXCEEDED = 'RATE_003',
  /** Upload rate limit exceeded */
  UPLOAD_LIMIT_EXCEEDED = 'RATE_004',
  /** Request throttled */
  THROTTLED = 'RATE_005',
}

/**
 * System error codes (SYS_*)
 * Used for internal system failures
 */
export enum SystemErrorCode {
  /** Internal server error */
  INTERNAL_ERROR = 'SYS_001',
  /** Service unavailable */
  SERVICE_UNAVAILABLE = 'SYS_002',
  /** Maintenance mode */
  MAINTENANCE_MODE = 'SYS_003',
  /** Configuration error */
  CONFIG_ERROR = 'SYS_004',
  /** Cache error */
  CACHE_ERROR = 'SYS_005',
  /** Queue error */
  QUEUE_ERROR = 'SYS_006',
  /** Scheduler error */
  SCHEDULER_ERROR = 'SYS_007',
  /** Memory limit exceeded */
  MEMORY_LIMIT = 'SYS_008',
  /** Unknown error */
  UNKNOWN_ERROR = 'SYS_009',
}

/**
 * Combined error code type
 */
export type ErrorCode =
  | AuthErrorCode
  | ValidationErrorCode
  | ResourceErrorCode
  | DatabaseErrorCode
  | FileErrorCode
  | ExternalErrorCode
  | RateLimitErrorCode
  | SystemErrorCode;

/**
 * Error code to HTTP status code mapping
 */
export const ErrorCodeHttpStatus: Record<string, number> = {
  // Auth errors - 401/403
  [AuthErrorCode.INVALID_CREDENTIALS]: 401,
  [AuthErrorCode.INVALID_TOKEN]: 401,
  [AuthErrorCode.TOKEN_EXPIRED]: 401,
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 401,
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 401,
  [AuthErrorCode.SESSION_EXPIRED]: 401,
  [AuthErrorCode.SESSION_NOT_FOUND]: 401,
  [AuthErrorCode.INVALID_RESET_TOKEN]: 401,
  [AuthErrorCode.RESET_TOKEN_EXPIRED]: 401,
  [AuthErrorCode.INVALID_API_KEY]: 401,
  [AuthErrorCode.ACCOUNT_INACTIVE]: 403,
  [AuthErrorCode.ACCOUNT_LOCKED]: 403,
  [AuthErrorCode.ACCOUNT_SUSPENDED]: 403,
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 403,
  [AuthErrorCode.TWO_FACTOR_REQUIRED]: 403,
  [AuthErrorCode.INVALID_TWO_FACTOR_CODE]: 403,
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [AuthErrorCode.ROLE_NOT_ALLOWED]: 403,
  [AuthErrorCode.OAUTH_ERROR]: 400,
  [AuthErrorCode.OAUTH_NOT_LINKED]: 400,

  // Validation errors - 400
  [ValidationErrorCode.VALIDATION_FAILED]: 400,
  [ValidationErrorCode.REQUIRED_FIELD]: 400,
  [ValidationErrorCode.INVALID_VALUE]: 400,
  [ValidationErrorCode.INVALID_FORMAT]: 400,
  [ValidationErrorCode.TOO_SHORT]: 400,
  [ValidationErrorCode.TOO_LONG]: 400,
  [ValidationErrorCode.BELOW_MINIMUM]: 400,
  [ValidationErrorCode.ABOVE_MAXIMUM]: 400,
  [ValidationErrorCode.INVALID_EMAIL]: 400,
  [ValidationErrorCode.INVALID_PASSWORD]: 400,
  [ValidationErrorCode.WEAK_PASSWORD]: 400,
  [ValidationErrorCode.INVALID_PHONE]: 400,
  [ValidationErrorCode.INVALID_URL]: 400,
  [ValidationErrorCode.INVALID_UUID]: 400,
  [ValidationErrorCode.INVALID_DATE]: 400,
  [ValidationErrorCode.INVALID_ENUM]: 400,
  [ValidationErrorCode.INVALID_JSON]: 400,
  [ValidationErrorCode.EMPTY_ARRAY]: 400,
  [ValidationErrorCode.ARRAY_TOO_LONG]: 400,
  [ValidationErrorCode.DUPLICATE_VALUE]: 400,

  // Resource errors - 404/409
  [ResourceErrorCode.NOT_FOUND]: 404,
  [ResourceErrorCode.ALREADY_EXISTS]: 409,
  [ResourceErrorCode.CONFLICT]: 409,
  [ResourceErrorCode.DELETED]: 410,
  [ResourceErrorCode.ARCHIVED]: 410,
  [ResourceErrorCode.LOCKED]: 423,
  [ResourceErrorCode.EXPIRED]: 410,
  [ResourceErrorCode.LIMIT_EXCEEDED]: 429,
  [ResourceErrorCode.QUOTA_EXCEEDED]: 429,
  [ResourceErrorCode.IN_USE]: 409,
  [ResourceErrorCode.NOT_AVAILABLE]: 503,
  [ResourceErrorCode.PENDING_APPROVAL]: 202,
  [ResourceErrorCode.REJECTED]: 400,
  [ResourceErrorCode.INVALID_STATE]: 400,
  [ResourceErrorCode.DEPENDENCY_ERROR]: 424,

  // Database errors - 500
  [DatabaseErrorCode.DATABASE_ERROR]: 500,
  [DatabaseErrorCode.CONNECTION_FAILED]: 503,
  [DatabaseErrorCode.QUERY_FAILED]: 500,
  [DatabaseErrorCode.TRANSACTION_FAILED]: 500,
  [DatabaseErrorCode.CONSTRAINT_VIOLATION]: 400,
  [DatabaseErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  [DatabaseErrorCode.UNIQUE_VIOLATION]: 409,
  [DatabaseErrorCode.DEADLOCK]: 500,
  [DatabaseErrorCode.TIMEOUT]: 504,
  [DatabaseErrorCode.RECORD_NOT_FOUND]: 404,
  [DatabaseErrorCode.MIGRATION_FAILED]: 500,
  [DatabaseErrorCode.SEED_FAILED]: 500,

  // File errors - 400/500
  [FileErrorCode.UPLOAD_FAILED]: 500,
  [FileErrorCode.FILE_TOO_LARGE]: 413,
  [FileErrorCode.INVALID_TYPE]: 415,
  [FileErrorCode.NOT_FOUND]: 404,
  [FileErrorCode.CORRUPTED]: 422,
  [FileErrorCode.STORAGE_LIMIT]: 507,
  [FileErrorCode.DOWNLOAD_FAILED]: 500,
  [FileErrorCode.DELETE_FAILED]: 500,
  [FileErrorCode.INVALID_NAME]: 400,
  [FileErrorCode.PROCESSING_FAILED]: 422,

  // External errors - 502/503
  [ExternalErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ExternalErrorCode.API_ERROR]: 502,
  [ExternalErrorCode.TIMEOUT]: 504,
  [ExternalErrorCode.RATE_LIMITED]: 429,
  [ExternalErrorCode.AUTH_FAILED]: 502,
  [ExternalErrorCode.INVALID_RESPONSE]: 502,
  [ExternalErrorCode.WEBHOOK_FAILED]: 502,
  [ExternalErrorCode.EMAIL_ERROR]: 502,
  [ExternalErrorCode.SMS_ERROR]: 502,
  [ExternalErrorCode.PAYMENT_ERROR]: 502,

  // Rate limit errors - 429
  [RateLimitErrorCode.TOO_MANY_REQUESTS]: 429,
  [RateLimitErrorCode.LOGIN_ATTEMPTS_EXCEEDED]: 429,
  [RateLimitErrorCode.API_LIMIT_EXCEEDED]: 429,
  [RateLimitErrorCode.UPLOAD_LIMIT_EXCEEDED]: 429,
  [RateLimitErrorCode.THROTTLED]: 429,

  // System errors - 500/503
  [SystemErrorCode.INTERNAL_ERROR]: 500,
  [SystemErrorCode.SERVICE_UNAVAILABLE]: 503,
  [SystemErrorCode.MAINTENANCE_MODE]: 503,
  [SystemErrorCode.CONFIG_ERROR]: 500,
  [SystemErrorCode.CACHE_ERROR]: 500,
  [SystemErrorCode.QUEUE_ERROR]: 500,
  [SystemErrorCode.SCHEDULER_ERROR]: 500,
  [SystemErrorCode.MEMORY_LIMIT]: 503,
  [SystemErrorCode.UNKNOWN_ERROR]: 500,
};

/**
 * Error code to default message mapping
 */
export const ErrorCodeMessage: Record<string, string> = {
  // Auth errors
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorCode.INVALID_TOKEN]: 'Invalid access token',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Access token has expired',
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: 'Invalid refresh token',
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token has expired',
  [AuthErrorCode.ACCOUNT_INACTIVE]: 'Account is not active',
  [AuthErrorCode.ACCOUNT_LOCKED]: 'Account is locked',
  [AuthErrorCode.ACCOUNT_SUSPENDED]: 'Account is suspended',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Email address not verified',
  [AuthErrorCode.TWO_FACTOR_REQUIRED]: 'Two-factor authentication required',
  [AuthErrorCode.INVALID_TWO_FACTOR_CODE]: 'Invalid two-factor code',
  [AuthErrorCode.SESSION_EXPIRED]: 'Session has expired',
  [AuthErrorCode.SESSION_NOT_FOUND]: 'Session not found',
  [AuthErrorCode.INVALID_RESET_TOKEN]: 'Invalid password reset token',
  [AuthErrorCode.RESET_TOKEN_EXPIRED]: 'Password reset token has expired',
  [AuthErrorCode.OAUTH_ERROR]: 'OAuth authentication error',
  [AuthErrorCode.OAUTH_NOT_LINKED]: 'OAuth account not linked',
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [AuthErrorCode.ROLE_NOT_ALLOWED]: 'Role not allowed for this action',
  [AuthErrorCode.INVALID_API_KEY]: 'Invalid API key',

  // Validation errors
  [ValidationErrorCode.VALIDATION_FAILED]: 'Validation failed',
  [ValidationErrorCode.REQUIRED_FIELD]: 'Required field is missing',
  [ValidationErrorCode.INVALID_VALUE]: 'Invalid value provided',
  [ValidationErrorCode.INVALID_FORMAT]: 'Invalid format',
  [ValidationErrorCode.TOO_SHORT]: 'Value is too short',
  [ValidationErrorCode.TOO_LONG]: 'Value is too long',
  [ValidationErrorCode.BELOW_MINIMUM]: 'Value is below minimum',
  [ValidationErrorCode.ABOVE_MAXIMUM]: 'Value is above maximum',
  [ValidationErrorCode.INVALID_EMAIL]: 'Invalid email address',
  [ValidationErrorCode.INVALID_PASSWORD]: 'Invalid password format',
  [ValidationErrorCode.WEAK_PASSWORD]: 'Password is too weak',
  [ValidationErrorCode.INVALID_PHONE]: 'Invalid phone number',
  [ValidationErrorCode.INVALID_URL]: 'Invalid URL format',
  [ValidationErrorCode.INVALID_UUID]: 'Invalid UUID format',
  [ValidationErrorCode.INVALID_DATE]: 'Invalid date format',
  [ValidationErrorCode.INVALID_ENUM]: 'Invalid enum value',
  [ValidationErrorCode.INVALID_JSON]: 'Invalid JSON format',
  [ValidationErrorCode.EMPTY_ARRAY]: 'Array cannot be empty',
  [ValidationErrorCode.ARRAY_TOO_LONG]: 'Array has too many items',
  [ValidationErrorCode.DUPLICATE_VALUE]: 'Duplicate value not allowed',

  // Resource errors
  [ResourceErrorCode.NOT_FOUND]: 'Resource not found',
  [ResourceErrorCode.ALREADY_EXISTS]: 'Resource already exists',
  [ResourceErrorCode.CONFLICT]: 'Resource conflict',
  [ResourceErrorCode.DELETED]: 'Resource has been deleted',
  [ResourceErrorCode.ARCHIVED]: 'Resource has been archived',
  [ResourceErrorCode.LOCKED]: 'Resource is locked',
  [ResourceErrorCode.EXPIRED]: 'Resource has expired',
  [ResourceErrorCode.LIMIT_EXCEEDED]: 'Resource limit exceeded',
  [ResourceErrorCode.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ResourceErrorCode.IN_USE]: 'Resource is in use',
  [ResourceErrorCode.NOT_AVAILABLE]: 'Resource is not available',
  [ResourceErrorCode.PENDING_APPROVAL]: 'Resource is pending approval',
  [ResourceErrorCode.REJECTED]: 'Resource was rejected',
  [ResourceErrorCode.INVALID_STATE]: 'Invalid resource state',
  [ResourceErrorCode.DEPENDENCY_ERROR]: 'Resource dependency error',

  // Database errors
  [DatabaseErrorCode.DATABASE_ERROR]: 'Database error occurred',
  [DatabaseErrorCode.CONNECTION_FAILED]: 'Database connection failed',
  [DatabaseErrorCode.QUERY_FAILED]: 'Database query failed',
  [DatabaseErrorCode.TRANSACTION_FAILED]: 'Database transaction failed',
  [DatabaseErrorCode.CONSTRAINT_VIOLATION]: 'Database constraint violation',
  [DatabaseErrorCode.FOREIGN_KEY_VIOLATION]: 'Foreign key constraint violation',
  [DatabaseErrorCode.UNIQUE_VIOLATION]: 'Unique constraint violation',
  [DatabaseErrorCode.DEADLOCK]: 'Database deadlock detected',
  [DatabaseErrorCode.TIMEOUT]: 'Database operation timeout',
  [DatabaseErrorCode.RECORD_NOT_FOUND]: 'Record not found',
  [DatabaseErrorCode.MIGRATION_FAILED]: 'Database migration failed',
  [DatabaseErrorCode.SEED_FAILED]: 'Database seed failed',

  // File errors
  [FileErrorCode.UPLOAD_FAILED]: 'File upload failed',
  [FileErrorCode.FILE_TOO_LARGE]: 'File is too large',
  [FileErrorCode.INVALID_TYPE]: 'Invalid file type',
  [FileErrorCode.NOT_FOUND]: 'File not found',
  [FileErrorCode.CORRUPTED]: 'File is corrupted',
  [FileErrorCode.STORAGE_LIMIT]: 'Storage limit exceeded',
  [FileErrorCode.DOWNLOAD_FAILED]: 'File download failed',
  [FileErrorCode.DELETE_FAILED]: 'File deletion failed',
  [FileErrorCode.INVALID_NAME]: 'Invalid file name',
  [FileErrorCode.PROCESSING_FAILED]: 'File processing failed',

  // External errors
  [ExternalErrorCode.SERVICE_UNAVAILABLE]: 'External service unavailable',
  [ExternalErrorCode.API_ERROR]: 'External API error',
  [ExternalErrorCode.TIMEOUT]: 'External service timeout',
  [ExternalErrorCode.RATE_LIMITED]: 'Rate limited by external service',
  [ExternalErrorCode.AUTH_FAILED]: 'External authentication failed',
  [ExternalErrorCode.INVALID_RESPONSE]: 'Invalid response from external service',
  [ExternalErrorCode.WEBHOOK_FAILED]: 'Webhook delivery failed',
  [ExternalErrorCode.EMAIL_ERROR]: 'Email service error',
  [ExternalErrorCode.SMS_ERROR]: 'SMS service error',
  [ExternalErrorCode.PAYMENT_ERROR]: 'Payment service error',

  // Rate limit errors
  [RateLimitErrorCode.TOO_MANY_REQUESTS]: 'Too many requests',
  [RateLimitErrorCode.LOGIN_ATTEMPTS_EXCEEDED]: 'Login attempts exceeded',
  [RateLimitErrorCode.API_LIMIT_EXCEEDED]: 'API rate limit exceeded',
  [RateLimitErrorCode.UPLOAD_LIMIT_EXCEEDED]: 'Upload rate limit exceeded',
  [RateLimitErrorCode.THROTTLED]: 'Request throttled',

  // System errors
  [SystemErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [SystemErrorCode.SERVICE_UNAVAILABLE]: 'Service unavailable',
  [SystemErrorCode.MAINTENANCE_MODE]: 'Service is under maintenance',
  [SystemErrorCode.CONFIG_ERROR]: 'Configuration error',
  [SystemErrorCode.CACHE_ERROR]: 'Cache error',
  [SystemErrorCode.QUEUE_ERROR]: 'Queue error',
  [SystemErrorCode.SCHEDULER_ERROR]: 'Scheduler error',
  [SystemErrorCode.MEMORY_LIMIT]: 'Memory limit exceeded',
  [SystemErrorCode.UNKNOWN_ERROR]: 'Unknown error occurred',
};

/**
 * Gets the HTTP status code for an error code
 * @param code - The error code
 * @returns HTTP status code (defaults to 500)
 */
export function getHttpStatusForErrorCode(code: ErrorCode): number {
  return ErrorCodeHttpStatus[code] ?? 500;
}

/**
 * Gets the default message for an error code
 * @param code - The error code
 * @returns Default error message
 */
export function getMessageForErrorCode(code: ErrorCode): string {
  return ErrorCodeMessage[code] ?? 'An error occurred';
}
