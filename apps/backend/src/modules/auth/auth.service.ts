import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponseDto,
  UserResponseDto,
  Auth2FARequiredResponseDto,
} from './dto/auth-response.dto';
import { Setup2FAResponseDto } from './dto/setup-2fa.dto';
import { PasswordService } from './services/password.service';
import { TokenService, TokenPair } from './services/token.service';
import { SessionService } from './services/session.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { TwoFactorService } from './services/two-factor.service';
import { GoogleProfile } from './strategies/google.strategy';
import { GitHubProfile } from './strategies/github.strategy';
import { UsersService } from '../users/users.service';

import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly twoFactorService: TwoFactorService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) { }


  /**
   * Register a new user
   */
  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(password);

    // Create user
    const user = await this.usersService.createRaw({
      email,
      password: hashedPassword,
      name,
    });

    // Generate email verification token
    const verificationToken = await this.emailVerificationService.generateToken(
      user.id,
      user.email,
    );

    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      ipAddress,
      userAgent,
    );

    // Create session
    await this.sessionService.createSession(
      user.id,
      user.email,
      tokens.accessToken.slice(-16), // Use last 16 chars as correlation
      ipAddress,
      userAgent,
    );

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; name: string } | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verify(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Check if password needs rehashing
    if (this.passwordService.needsRehash(user.password)) {
      const newHash = await this.passwordService.hash(password);
      await this.usersService.update(user.id, { password: newHash });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Login user (after LocalStrategy validation)
   */
  async login(
    user: { id: string; email: string; name: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto | Auth2FARequiredResponseDto> {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if 2FA is enabled
    if (fullUser.twoFactorEnabled) {
      const tempToken = this.tokenService.generateTemp2FAToken(
        fullUser.id,
        fullUser.email,
      );

      return {
        requires2FA: true,
        tempToken,
        expiresIn: 300, // 5 minutes
      };
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      fullUser.id,
      fullUser.email,
      ipAddress,
      userAgent,
    );

    // Create session
    await this.sessionService.createSession(
      fullUser.id,
      fullUser.email,
      tokens.accessToken.slice(-16),
      ipAddress,
      userAgent,
    );

    return this.buildAuthResponse(fullUser, tokens);
  }

  /**
   * Complete login with 2FA verification
   */
  async verify2FALogin(
    tempToken: string,
    token: string,
    isRecoveryCode: boolean = false,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    // Verify temp token
    const tempData = this.tokenService.verifyTemp2FAToken(tempToken);
    if (!tempData) {
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }

    const user = await this.usersService.findById(tempData.userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('User not found or 2FA not configured');
    }

    let isValid: boolean;

    if (isRecoveryCode) {
      isValid = await this.twoFactorService.verifyRecoveryCode(user.id, token);
    } else {
      isValid = await this.twoFactorService.verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      ipAddress,
      userAgent,
    );

    // Create session
    await this.sessionService.createSession(
      user.id,
      user.email,
      tokens.accessToken.slice(-16),
      ipAddress,
      userAgent,
    );

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Logout user (revoke session and tokens)
   */
  async logout(
    userId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    // Blacklist the access token
    const accessTokenExpiry = 15 * 60; // 15 minutes in seconds
    await this.sessionService.blacklistToken(accessToken, accessTokenExpiry);

    // If refresh token provided, revoke its family
    if (refreshToken) {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      if (payload?.tokenFamily) {
        await this.tokenService.revokeTokenFamily(payload.tokenFamily, 'logout');
      }
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<number> {
    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserTokens(userId, 'logout_all');

    // Invalidate all sessions
    const count = await this.sessionService.invalidateAllUserSessions(userId);

    return count;
  }

  /**
   * Refresh access token
   */
  async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const newTokens = await this.tokenService.rotateRefreshToken(
      refreshToken,
      ipAddress,
      userAgent,
    );

    if (!newTokens) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = this.tokenService.verifyAccessToken(newTokens.accessToken);
    if (!payload) {
      throw new UnauthorizedException('Failed to generate new tokens');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildAuthResponse(user, newTokens);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const tokenData = await this.emailVerificationService.verifyToken(token);
    if (!tokenData) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.usersService.findById(tokenData.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.usersService.updateRaw(user.id, { emailVerified: true });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    const token = await this.passwordResetService.generateToken(
      user.id,
      user.email,
    );

    if (!token) {
      // Rate limited
      return;
    }

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenData = await this.passwordResetService.consumeToken(token);
    if (!tokenData) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findById(tokenData.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await this.passwordService.hash(newPassword);

    // Update password
    await this.usersService.updateRaw(user.id, { password: hashedPassword });

    // Revoke all existing tokens (force re-login)
    await this.tokenService.revokeAllUserTokens(user.id, 'password_reset');
    await this.sessionService.invalidateAllUserSessions(user.id);
  }

  /**
   * Setup 2FA
   */
  async setup2FA(userId: string): Promise<Setup2FAResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const setupData = await this.twoFactorService.generateSetup(
      user.id,
      user.email,
    );

    return {
      secret: setupData.secret,
      qrCode: setupData.qrCode,
      recoveryCodes: setupData.recoveryCodes,
    };
  }

  /**
   * Verify and enable 2FA
   */
  async verify2FA(userId: string, token: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = await this.twoFactorService.verifySetup(userId, token);
    if (!secret) {
      throw new BadRequestException('Invalid 2FA token. Please try again.');
    }

    // Enable 2FA for user
    await this.usersService.updateRaw(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    });
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    if (!user.password) {
      throw new ForbiddenException(
        'Cannot disable 2FA for OAuth-only accounts',
      );
    }

    const isPasswordValid = await this.passwordService.verify(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Disable 2FA
    await this.twoFactorService.disable2FA(userId);
    await this.usersService.updateRaw(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
    });
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleAuth(
    profile: GoogleProfile,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    // Check if user exists by Google ID
    let user = await this.usersService.findByGoogleId(profile.id);

    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(profile.email);

      if (user) {
        // Link Google account to existing user
        await this.usersService.updateRaw(user.id, {
          avatar: user.avatar || profile.picture,
          emailVerified: true,
          metadata: { ...user.metadata, googleId: profile.id },
        });
        user = await this.usersService.findById(user.id);
      } else {
        // Create new user
        user = await this.usersService.createFromOAuth({
          email: profile.email,
          name: profile.name,
          emailVerified: profile.emailVerified,
          googleId: profile.id,
          avatarUrl: profile.picture,
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      ipAddress,
      userAgent,
    );

    // Create session
    await this.sessionService.createSession(
      user.id,
      user.email,
      tokens.accessToken.slice(-16),
      ipAddress,
      userAgent,
    );

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGitHubAuth(
    profile: GitHubProfile,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    // Check if user exists by GitHub ID
    let user = await this.usersService.findByGithubId(profile.id);

    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(profile.email);

      if (user) {
        // Link GitHub account to existing user
        await this.usersService.updateRaw(user.id, {
          avatar: user.avatar || profile.avatarUrl,
          emailVerified: true,
          metadata: { ...user.metadata, githubId: profile.id },
        });
        user = await this.usersService.findById(user.id);
      } else {
        // Create new user
        user = await this.usersService.createFromOAuth({
          email: profile.email,
          name: profile.name,
          emailVerified: true, // GitHub emails are verified
          githubId: profile.id,
          avatarUrl: profile.avatarUrl,
        });
      }
    }

    if (!user) {
      throw new UnauthorizedException('Failed to authenticate with GitHub');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      ipAddress,
      userAgent,
    );

    // Create session
    await this.sessionService.createSession(
      user.id,
      user.email,
      tokens.accessToken.slice(-16),
      ipAddress,
      userAgent,
    );

    return this.buildAuthResponse(user, tokens);
  }

  /**
   * Build auth response with tokens and user data
   */
  private buildAuthResponse(user: User, tokens: TokenPair): AuthResponseDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: 'Bearer',
      user: this.mapUserToResponse(user),
    };
  }

  /**
   * Map user entity to response DTO
   */
  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      roles: user.roles,
    };
  }
}
