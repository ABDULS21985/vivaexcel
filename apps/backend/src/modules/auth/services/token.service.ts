import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { RefreshToken } from '../entities/refresh-token.entity';
import { PasswordService } from './password.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  correlationId: string;
  type: 'access' | 'refresh';
  tokenFamily?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly accessTokenExpirySeconds: number;
  private readonly refreshTokenExpiryDays: number;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    this.accessTokenExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    this.refreshTokenExpiry =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
    this.accessTokenExpirySeconds = this.parseExpiryToSeconds(
      this.accessTokenExpiry,
    );
    this.refreshTokenExpiryDays = this.parseExpiryToDays(
      this.refreshTokenExpiry,
    );
    this.accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'access-secret';
    this.refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret';
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  private parseExpiryToDays(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7; // default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value / 86400;
      case 'm':
        return value / 1440;
      case 'h':
        return value / 24;
      case 'd':
        return value;
      default:
        return 7;
    }
  }

  /**
   * Generate a new token pair (access + refresh tokens)
   */
  async generateTokenPair(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
    existingTokenFamily?: string,
  ): Promise<TokenPair> {
    const correlationId = uuidv4();
    const tokenFamily = existingTokenFamily || nanoid(32);

    // Generate access token
    const accessPayload = {
      sub: userId,
      email,
      correlationId,
      type: 'access' as const,
    };

    const accessTokenOptions: JwtSignOptions = {
      expiresIn: this.accessTokenExpirySeconds,
      secret: this.accessTokenSecret,
    };

    const accessToken = this.jwtService.sign(accessPayload, accessTokenOptions);

    // Generate refresh token
    const refreshPayload = {
      sub: userId,
      email,
      correlationId,
      type: 'refresh' as const,
      tokenFamily,
    };

    const refreshTokenOptions: JwtSignOptions = {
      expiresIn: this.refreshTokenExpiryDays * 86400, // Convert days to seconds
      secret: this.refreshTokenSecret,
    };

    const refreshToken = this.jwtService.sign(
      refreshPayload,
      refreshTokenOptions,
    );

    // Store refresh token hash in database
    const tokenHash = await this.passwordService.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiryDays);

    await this.refreshTokenRepository.save({
      userId,
      tokenFamily,
      tokenHash,
      correlationId,
      ipAddress,
      userAgent,
      expiresAt,
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpirySeconds,
    };
  }

  /**
   * Verify and decode an access token
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessTokenSecret,
      });

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Verify and decode a refresh token
   */
  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.refreshTokenSecret,
      });

      if (payload.type !== 'refresh') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Rotate refresh token - invalidate old and issue new
   * Implements token family tracking for revocation detection
   */
  async rotateRefreshToken(
    oldRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair | null> {
    const payload = this.verifyRefreshToken(oldRefreshToken);
    if (!payload || !payload.tokenFamily) {
      return null;
    }

    const tokenHash = await this.passwordService.hashToken(oldRefreshToken);

    // Find the stored token
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        userId: payload.sub,
        tokenFamily: payload.tokenFamily,
      },
    });

    if (!storedToken) {
      // Token not found - possible replay attack
      // Revoke entire token family
      await this.revokeTokenFamily(payload.tokenFamily, 'token_not_found');
      return null;
    }

    if (storedToken.isRevoked) {
      // Token already used - replay attack detected
      // Revoke entire token family
      await this.revokeTokenFamily(payload.tokenFamily, 'replay_attack');
      return null;
    }

    if (storedToken.expiresAt < new Date()) {
      // Token expired
      await this.revokeTokenFamily(payload.tokenFamily, 'expired');
      return null;
    }

    // Revoke the old token
    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    storedToken.revokedReason = 'rotated';
    await this.refreshTokenRepository.save(storedToken);

    // Generate new token pair with same family
    return this.generateTokenPair(
      payload.sub,
      payload.email,
      ipAddress,
      userAgent,
      payload.tokenFamily,
    );
  }

  /**
   * Revoke all tokens in a token family
   */
  async revokeTokenFamily(
    tokenFamily: string,
    reason: string = 'manual',
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { tokenFamily, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    );
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(
    userId: string,
    reason: string = 'logout_all',
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    );
  }

  /**
   * Check if a refresh token is valid (not revoked)
   */
  async isRefreshTokenValid(token: string): Promise<boolean> {
    const payload = this.verifyRefreshToken(token);
    if (!payload) return false;

    const tokenHash = await this.passwordService.hashToken(token);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        userId: payload.sub,
        isRevoked: false,
      },
    });

    return storedToken !== null && storedToken.expiresAt > new Date();
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  /**
   * Generate a temporary token for 2FA verification
   */
  generateTemp2FAToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email,
      type: '2fa_pending',
      correlationId: uuidv4(),
    };

    return this.jwtService.sign(payload, {
      expiresIn: 300, // 5 minute expiry for 2FA (in seconds)
      secret: this.accessTokenSecret,
    });
  }

  /**
   * Verify a temporary 2FA token
   */
  verifyTemp2FAToken(token: string): { userId: string; email: string } | null {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        type: string;
      }>(token, {
        secret: this.accessTokenSecret,
      });

      if (payload.type !== '2fa_pending') {
        return null;
      }

      return { userId: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }
}
