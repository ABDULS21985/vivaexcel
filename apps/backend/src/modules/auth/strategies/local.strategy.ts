import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LockoutService } from '../services/lockout.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly lockoutService: LockoutService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request & { ip?: string },
    email: string,
    password: string,
  ): Promise<{ id: string; email: string; name: string }> {
    const ipAddress = request.ip;

    // Check lockout status
    const { emailLocked, ipLocked } =
      await this.lockoutService.isLockedOutByEmailOrIP(email, ipAddress);

    if (emailLocked.isLocked) {
      const remainingMinutes = emailLocked.lockoutEndsAt
        ? Math.ceil(
            (emailLocked.lockoutEndsAt.getTime() - Date.now()) / 60000,
          )
        : 15;
      throw new UnauthorizedException(
        `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
      );
    }

    if (ipLocked?.isLocked) {
      const remainingMinutes = ipLocked.lockoutEndsAt
        ? Math.ceil((ipLocked.lockoutEndsAt.getTime() - Date.now()) / 60000)
        : 15;
      throw new UnauthorizedException(
        `Too many failed login attempts from this IP. Please try again in ${remainingMinutes} minutes.`,
      );
    }

    // Attempt to validate credentials
    const user = await this.authService.validateUserCredentials(
      email,
      password,
    );

    if (!user) {
      // Record failed attempt
      await this.lockoutService.recordFailedAttemptForEmailAndIP(
        email,
        ipAddress,
      );

      const status = await this.lockoutService.isLockedOut(email);
      if (status.attemptsRemaining > 0) {
        throw new UnauthorizedException(
          `Invalid email or password. ${status.attemptsRemaining} attempts remaining before lockout.`,
        );
      } else {
        throw new UnauthorizedException(
          'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
        );
      }
    }

    // Clear failed attempts on successful login
    await this.lockoutService.clearAttemptsForEmailAndIP(email, ipAddress);

    return user;
  }
}
