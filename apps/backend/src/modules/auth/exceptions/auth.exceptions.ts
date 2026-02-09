import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * Custom TooManyRequestsException since NestJS doesn't have it built-in
 */
export class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * Thrown when user credentials are invalid
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(attemptsRemaining?: number) {
    super(
      attemptsRemaining
        ? `Invalid email or password. ${attemptsRemaining} attempts remaining before lockout.`
        : 'Invalid email or password.',
    );
  }
}

/**
 * Thrown when account is locked due to too many failed attempts
 */
export class AccountLockedException extends TooManyRequestsException {
  constructor(minutesRemaining: number) {
    super(
      `Account temporarily locked due to too many failed attempts. Please try again in ${minutesRemaining} minutes.`,
    );
  }
}

/**
 * Thrown when a token is invalid or expired
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor(tokenType: string = 'token') {
    super(`Invalid or expired ${tokenType}`);
  }
}

/**
 * Thrown when token has been revoked
 */
export class TokenRevokedException extends UnauthorizedException {
  constructor() {
    super('Token has been revoked');
  }
}

/**
 * Thrown when 2FA is required to complete login
 */
export class TwoFactorRequiredException extends ForbiddenException {
  constructor() {
    super('Two-factor authentication is required');
  }
}

/**
 * Thrown when 2FA token is invalid
 */
export class InvalidTwoFactorTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid two-factor authentication token');
  }
}

/**
 * Thrown when 2FA is already enabled
 */
export class TwoFactorAlreadyEnabledException extends BadRequestException {
  constructor() {
    super('Two-factor authentication is already enabled');
  }
}

/**
 * Thrown when 2FA is not enabled but operation requires it
 */
export class TwoFactorNotEnabledException extends BadRequestException {
  constructor() {
    super('Two-factor authentication is not enabled');
  }
}

/**
 * Thrown when user already exists
 */
export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super('User with this email already exists');
  }
}

/**
 * Thrown when email is not verified
 */
export class EmailNotVerifiedException extends ForbiddenException {
  constructor() {
    super('Please verify your email address to continue');
  }
}

/**
 * Thrown when email is already verified
 */
export class EmailAlreadyVerifiedException extends BadRequestException {
  constructor() {
    super('Email is already verified');
  }
}

/**
 * Thrown when password reset rate limit is exceeded
 */
export class PasswordResetRateLimitException extends TooManyRequestsException {
  constructor(minutesRemaining: number) {
    super(
      `Too many password reset requests. Please try again in ${minutesRemaining} minutes.`,
    );
  }
}

/**
 * Thrown when OAuth authentication fails
 */
export class OAuthException extends UnauthorizedException {
  constructor(provider: string, message?: string) {
    super(message || `Failed to authenticate with ${provider}`);
  }
}

/**
 * Thrown when session is invalid or expired
 */
export class InvalidSessionException extends UnauthorizedException {
  constructor() {
    super('Session is invalid or has expired');
  }
}
