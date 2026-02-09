import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { TOTP, generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { PasswordService } from './password.service';

export interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
  recoveryCodes: string[];
}

@Injectable()
export class TwoFactorService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly pendingSetupPrefix = '2fa_pending:';
  private readonly recoveryCodesPrefix = '2fa_recovery:';
  private readonly appName: string;
  private readonly recoveryCodeCount = 10;
  private readonly totp: TOTP;

  constructor(
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB') || 0,
      keyPrefix: this.configService.get<string>('REDIS_PREFIX') || 'auth:',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.appName = this.configService.get<string>('APP_NAME') || 'DigiWeb';

    // Initialize TOTP instance
    this.totp = new TOTP({
      digits: 6,
      period: 30, // 30 second window
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Generate a new TOTP secret and QR code for 2FA setup
   */
  async generateSetup(
    userId: string,
    email: string,
  ): Promise<TwoFactorSetupData> {
    // Generate secret
    const secret = await generateSecret();

    // Generate OTP Auth URL
    const otpAuthUrl = generateURI({
      secret,
      issuer: this.appName,
      label: email,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 256,
    });

    // Generate recovery codes
    const recoveryCodes = await this.generateRecoveryCodes();

    // Store pending setup (expires in 10 minutes)
    const setupData = {
      secret,
      recoveryCodes: recoveryCodes.map((code) => code.hash),
    };

    await this.redis.setex(
      `${this.pendingSetupPrefix}${userId}`,
      600, // 10 minutes
      JSON.stringify(setupData),
    );

    return {
      secret,
      qrCode,
      recoveryCodes: recoveryCodes.map((code) => code.plain),
    };
  }

  /**
   * Generate recovery codes
   */
  private async generateRecoveryCodes(): Promise<
    Array<{ plain: string; hash: string }>
  > {
    const codes: Array<{ plain: string; hash: string }> = [];

    for (let i = 0; i < this.recoveryCodeCount; i++) {
      // Generate 8-character alphanumeric code
      const plain = (await this.passwordService.generateSecureToken(4))
        .toUpperCase()
        .slice(0, 8);
      const hash = await this.passwordService.hashToken(plain);
      codes.push({ plain, hash });
    }

    return codes;
  }

  /**
   * Verify TOTP token during 2FA setup
   */
  async verifySetup(userId: string, token: string): Promise<string | null> {
    // Get pending setup data
    const data = await this.redis.get(`${this.pendingSetupPrefix}${userId}`);
    if (!data) return null;

    try {
      const setupData = JSON.parse(data);

      // Verify the TOTP token
      const result = await verify({
        token,
        secret: setupData.secret,
        algorithm: 'sha1',
        digits: 6,
        period: 30,
      });

      if (result.valid !== true) return null;

      // Store recovery codes
      await this.redis.set(
        `${this.recoveryCodesPrefix}${userId}`,
        JSON.stringify(setupData.recoveryCodes),
      );

      // Clean up pending setup
      await this.redis.del(`${this.pendingSetupPrefix}${userId}`);

      return setupData.secret;
    } catch {
      return null;
    }
  }

  /**
   * Verify TOTP token for authentication
   */
  async verifyToken(secret: string, token: string): Promise<boolean> {
    try {
      const result = await verify({
        token,
        secret,
        algorithm: 'sha1',
        digits: 6,
        period: 30,
      });
      return result.valid === true;
    } catch {
      return false;
    }
  }

  /**
   * Verify a recovery code
   */
  async verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
    const data = await this.redis.get(`${this.recoveryCodesPrefix}${userId}`);
    if (!data) return false;

    try {
      const codeHashes: string[] = JSON.parse(data);
      const inputHash = await this.passwordService.hashToken(
        code.toUpperCase().replace(/\s/g, ''),
      );

      const index = codeHashes.indexOf(inputHash);
      if (index === -1) return false;

      // Remove used recovery code
      codeHashes.splice(index, 1);
      await this.redis.set(
        `${this.recoveryCodesPrefix}${userId}`,
        JSON.stringify(codeHashes),
      );

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get remaining recovery codes count
   */
  async getRemainingRecoveryCodesCount(userId: string): Promise<number> {
    const data = await this.redis.get(`${this.recoveryCodesPrefix}${userId}`);
    if (!data) return 0;

    try {
      const codeHashes: string[] = JSON.parse(data);
      return codeHashes.length;
    } catch {
      return 0;
    }
  }

  /**
   * Regenerate recovery codes (returns new codes)
   */
  async regenerateRecoveryCodes(userId: string): Promise<string[]> {
    const recoveryCodes = await this.generateRecoveryCodes();

    await this.redis.set(
      `${this.recoveryCodesPrefix}${userId}`,
      JSON.stringify(recoveryCodes.map((code) => code.hash)),
    );

    return recoveryCodes.map((code) => code.plain);
  }

  /**
   * Disable 2FA - clear recovery codes
   */
  async disable2FA(userId: string): Promise<void> {
    await this.redis.del(`${this.recoveryCodesPrefix}${userId}`);
    await this.redis.del(`${this.pendingSetupPrefix}${userId}`);
  }

  /**
   * Check if user has 2FA setup pending
   */
  async hasPendingSetup(userId: string): Promise<boolean> {
    const exists = await this.redis.exists(
      `${this.pendingSetupPrefix}${userId}`,
    );
    return exists === 1;
  }

  /**
   * Cancel pending 2FA setup
   */
  async cancelPendingSetup(userId: string): Promise<void> {
    await this.redis.del(`${this.pendingSetupPrefix}${userId}`);
  }
}
