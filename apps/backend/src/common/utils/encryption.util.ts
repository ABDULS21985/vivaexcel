import * as crypto from 'crypto';

/**
 * Encryption algorithm used for field-level encryption
 */
const ALGORITHM = 'aes-256-gcm';

/**
 * IV (Initialization Vector) length in bytes
 */
const IV_LENGTH = 16;

/**
 * Auth tag length in bytes
 */
const AUTH_TAG_LENGTH = 16;

/**
 * Salt length for key derivation
 */
const SALT_LENGTH = 32;

/**
 * Key derivation iterations
 */
const PBKDF2_ITERATIONS = 100000;

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Encrypted data (base64) */
  encrypted: string;
  /** Initialization vector (base64) */
  iv: string;
  /** Authentication tag (base64) */
  authTag: string;
  /** Salt for key derivation (base64) - only present if password-based */
  salt?: string;
}

/**
 * Encryption utility class for AES-256-GCM field-level encryption.
 *
 * Features:
 * - AES-256-GCM authenticated encryption
 * - Unique IV for each encryption
 * - Password-based key derivation (PBKDF2)
 * - Direct key encryption support
 * - JSON object encryption
 *
 * @example
 * // Using environment key
 * ```typescript
 * const encryptor = new EncryptionUtil(process.env.ENCRYPTION_KEY);
 *
 * const encrypted = encryptor.encrypt('sensitive data');
 * const decrypted = encryptor.decrypt(encrypted);
 * ```
 *
 * @example
 * // Encrypting objects
 * ```typescript
 * const user = { ssn: '123-45-6789', name: 'John' };
 * const encrypted = encryptor.encryptObject(user);
 * const decrypted = encryptor.decryptObject(encrypted);
 * ```
 */
export class EncryptionUtil {
  private readonly key: Buffer;

  /**
   * Creates a new EncryptionUtil instance
   * @param encryptionKey - 32-byte key (hex or base64) or password for key derivation
   * @throws Error if key is invalid
   */
  constructor(encryptionKey: string) {
    if (!encryptionKey) {
      throw new Error('Encryption key is required');
    }

    // Try to use the key directly if it's the right length
    if (encryptionKey.length === 64) {
      // 64 hex characters = 32 bytes
      this.key = Buffer.from(encryptionKey, 'hex');
    } else if (encryptionKey.length === 44) {
      // 44 base64 characters = 32 bytes
      this.key = Buffer.from(encryptionKey, 'base64');
    } else if (encryptionKey.length === 32) {
      // 32 raw bytes
      this.key = Buffer.from(encryptionKey, 'utf8');
    } else {
      // Derive key from password using PBKDF2 with a fixed salt
      // Note: For truly secure password-based encryption, use encryptWithPassword
      const salt = crypto
        .createHash('sha256')
        .update('digiweb-static-salt')
        .digest();
      this.key = crypto.pbkdf2Sync(
        encryptionKey,
        salt,
        PBKDF2_ITERATIONS,
        32,
        'sha256',
      );
    }

    if (this.key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (256 bits)');
    }
  }

  /**
   * Encrypts a string using AES-256-GCM
   * @param plaintext - String to encrypt
   * @returns Encrypted data object
   */
  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  /**
   * Decrypts encrypted data
   * @param encryptedData - Encrypted data object
   * @returns Decrypted string
   * @throws Error if decryption fails
   */
  decrypt(encryptedData: EncryptedData): string {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * Encrypts a string and returns a single base64 string
   * @param plaintext - String to encrypt
   * @returns Combined base64 string (iv + authTag + encrypted)
   */
  encryptToString(plaintext: string): string {
    const { encrypted, iv, authTag } = this.encrypt(plaintext);
    return `${iv}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a combined base64 string
   * @param encryptedString - Combined encrypted string
   * @returns Decrypted string
   */
  decryptFromString(encryptedString: string): string {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted string format');
    }

    return this.decrypt({
      iv: parts[0],
      authTag: parts[1],
      encrypted: parts[2],
    });
  }

  /**
   * Encrypts a JSON object
   * @param obj - Object to encrypt
   * @returns Encrypted data object
   */
  encryptObject<T>(obj: T): EncryptedData {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypts to a JSON object
   * @param encryptedData - Encrypted data object
   * @returns Decrypted object
   */
  decryptObject<T>(encryptedData: EncryptedData): T {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json) as T;
  }

  /**
   * Encrypts a string with a password (includes salt)
   * @param plaintext - String to encrypt
   * @param password - Password to use for encryption
   * @returns Encrypted data object with salt
   */
  static encryptWithPassword(
    plaintext: string,
    password: string,
  ): EncryptedData {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      32,
      'sha256',
    );

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      salt: salt.toString('base64'),
    };
  }

  /**
   * Decrypts data encrypted with a password
   * @param encryptedData - Encrypted data object with salt
   * @param password - Password used for encryption
   * @returns Decrypted string
   */
  static decryptWithPassword(
    encryptedData: EncryptedData,
    password: string,
  ): string {
    if (!encryptedData.salt) {
      throw new Error('Salt is required for password-based decryption');
    }

    const salt = Buffer.from(encryptedData.salt, 'base64');
    const key = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      32,
      'sha256',
    );

    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * Generates a random encryption key
   * @returns 32-byte key as hex string
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a random encryption key as base64
   * @returns 32-byte key as base64 string
   */
  static generateKeyBase64(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Creates a deterministic hash of a value (for searching encrypted fields)
   * @param value - Value to hash
   * @param salt - Salt for the hash
   * @returns SHA-256 hash as hex string
   */
  static hash(value: string, salt: string = ''): string {
    return crypto
      .createHash('sha256')
      .update(salt + value)
      .digest('hex');
  }

  /**
   * Creates a HMAC of a value
   * @param value - Value to HMAC
   * @param key - Key for HMAC
   * @returns HMAC as hex string
   */
  static hmac(value: string, key: string): string {
    return crypto.createHmac('sha256', key).update(value).digest('hex');
  }
}

/**
 * Singleton encryption utility using environment key
 */
let defaultEncryptor: EncryptionUtil | null = null;

/**
 * Gets or creates the default encryption utility
 * @returns EncryptionUtil instance
 * @throws Error if ENCRYPTION_KEY is not set
 */
export function getEncryptor(): EncryptionUtil {
  if (!defaultEncryptor) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    defaultEncryptor = new EncryptionUtil(key);
  }
  return defaultEncryptor;
}

/**
 * Encrypts a value using the default encryptor
 * @param plaintext - String to encrypt
 * @returns Combined encrypted string
 */
export function encrypt(plaintext: string): string {
  return getEncryptor().encryptToString(plaintext);
}

/**
 * Decrypts a value using the default encryptor
 * @param encrypted - Combined encrypted string
 * @returns Decrypted string
 */
export function decrypt(encrypted: string): string {
  return getEncryptor().decryptFromString(encrypted);
}
