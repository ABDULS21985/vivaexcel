import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  private readonly argon2Options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 parallel threads
    hashLength: 32, // 32 bytes output
  };

  /**
   * Hash a password using Argon2id
   * @param password - Plain text password to hash
   * @returns Hashed password string
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.argon2Options);
  }

  /**
   * Verify a password against a hash
   * @param hash - Stored password hash
   * @param password - Plain text password to verify
   * @returns True if password matches, false otherwise
   */
  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Check if a password hash needs to be rehashed due to updated parameters
   * @param hash - Existing password hash
   * @returns True if the hash should be regenerated
   */
  needsRehash(hash: string): boolean {
    try {
      return argon2.needsRehash(hash, this.argon2Options);
    } catch {
      return true;
    }
  }

  /**
   * Generate a secure random token for password reset, email verification, etc.
   * @param length - Length of the token in bytes (default 32)
   * @returns Hex-encoded random token
   */
  async generateSecureToken(length: number = 32): Promise<string> {
    const { randomBytes } = await import('crypto');
    return new Promise((resolve, reject) => {
      randomBytes(length, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer.toString('hex'));
      });
    });
  }

  /**
   * Hash a token for secure storage (using SHA-256)
   * @param token - Plain text token
   * @returns Hashed token
   */
  async hashToken(token: string): Promise<string> {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(token).digest('hex');
  }
}
