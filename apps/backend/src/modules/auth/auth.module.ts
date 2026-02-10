import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controller
import { AuthController } from './auth.controller';

// Main Service
import { AuthService } from './auth.service';

// Support Services
import {
  PasswordService,
  TokenService,
  SessionService,
  LockoutService,
  EmailVerificationService,
  PasswordResetService,
  TwoFactorService,
} from './services';

// Strategies
import {
  JwtStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
  GoogleStrategy,
  GitHubStrategy,
} from './strategies';

// Guards
import {
  LocalAuthGuard,
  JwtAuthGuard,
  JwtRefreshGuard,
  GoogleAuthGuard,
  GitHubAuthGuard,
} from './guards';

// Entities
import { RefreshToken } from './entities';

// Feature modules
import { UsersModule } from '../users/users.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule,

    // Passport module with default strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: 900, // 15 minutes in seconds
          issuer: configService.get<string>('JWT_ISSUER') || 'ktblog',
          audience: configService.get<string>('JWT_AUDIENCE') || 'ktblog-api',
        },
      }),
    }),

    // TypeORM entities
    TypeOrmModule.forFeature([RefreshToken]),

    // Users module
    forwardRef(() => UsersModule),

    // Referrals module
    forwardRef(() => ReferralsModule),
  ],
  controllers: [AuthController],
  providers: [
    // Main Auth Service
    AuthService,

    // Support Services
    PasswordService,
    TokenService,
    SessionService,
    LockoutService,
    EmailVerificationService,
    PasswordResetService,
    TwoFactorService,

    // Passport Strategies
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,

    // Guards
    LocalAuthGuard,
    JwtAuthGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    GitHubAuthGuard,
  ],
  exports: [
    // Export services for use in other modules
    AuthService,
    PasswordService,
    TokenService,
    SessionService,
    LockoutService,

    // Export guards for use in other modules
    JwtAuthGuard,
    JwtRefreshGuard,

    // Export Passport module
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule { }
