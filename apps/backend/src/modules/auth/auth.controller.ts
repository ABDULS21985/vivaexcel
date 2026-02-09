import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Setup2FADto, Setup2FAResponseDto } from './dto/setup-2fa.dto';
import { Verify2FADto, Verify2FALoginDto } from './dto/verify-2fa.dto';
import {
  AuthResponseDto,
  UserResponseDto,
  Auth2FARequiredResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GitHubAuthGuard } from './guards/github-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';
import { GoogleProfile } from './strategies/google.strategy';
import { GitHubProfile } from './strategies/github.strategy';

interface RequestWithUser extends Request {
  user: CurrentUserPayload | { id: string; email: string; name: string };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];

    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: '2FA required',
    type: Auth2FARequiredResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Account locked' })
  async login(
    @Req() req: RequestWithUser,
  ): Promise<AuthResponseDto | Auth2FARequiredResponseDto> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];
    const user = req.user as { id: string; email: string; name: string };

    return this.authService.login(user, ipAddress, userAgent);
  }

  @Post('login/2fa')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete login with 2FA verification' })
  @ApiResponse({
    status: 200,
    description: '2FA verification successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid 2FA token' })
  async verify2FALogin(
    @Body() body: Verify2FALoginDto & { tempToken: string },
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];

    return this.authService.verify2FALogin(
      body.tempToken,
      body.token,
      body.isRecoveryCode,
      ipAddress,
      userAgent,
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
  ): Promise<MessageResponseDto> {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.replace('Bearer ', '') || '';

    await this.authService.logout(user.userId, accessToken, body.refreshToken);

    return { message: 'Logged out successfully' };
  }

  @Post('logout/all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MessageResponseDto> {
    const count = await this.authService.logoutAll(user.userId);

    return { message: `Logged out from ${count} sessions` };
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req: Request & { user: { refreshToken: string } },
  ): Promise<AuthResponseDto> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];

    return this.authService.refreshTokens(
      req.user.refreshToken,
      ipAddress,
      userAgent,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(user.userId);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<MessageResponseDto> {
    await this.authService.verifyEmail(verifyEmailDto.token);

    return { message: 'Email verified successfully' };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto.email);

    // Always return success to prevent email enumeration
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return { message: 'Password reset successfully. Please login with your new password.' };
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiBody({ type: Setup2FADto })
  @ApiResponse({
    status: 200,
    description: '2FA setup initiated',
    type: Setup2FAResponseDto,
  })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setup2FA(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<Setup2FAResponseDto> {
    return this.authService.setup2FA(user.userId);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verify2FA(
    @CurrentUser() user: CurrentUserPayload,
    @Body() verify2FADto: Verify2FADto,
  ): Promise<MessageResponseDto> {
    await this.authService.verify2FA(user.userId, verify2FADto.token);

    return { message: '2FA enabled successfully' };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid password' })
  async disable2FA(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { password: string },
  ): Promise<MessageResponseDto> {
    await this.authService.disable2FA(user.userId, body.password);

    return { message: '2FA disabled successfully' };
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ): Promise<void> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const authResponse = await this.authService.handleGoogleAuth(
        req.user,
        ipAddress,
        userAgent,
      );

      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        expiresIn: authResponse.expiresIn.toString(),
      });

      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';
      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Get('github')
  @Public()
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub' })
  async githubAuth(): Promise<void> {
    // Guard redirects to GitHub
  }

  @Get('github/callback')
  @Public()
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  async githubAuthCallback(
    @Req() req: Request & { user: GitHubProfile },
    @Res() res: Response,
  ): Promise<void> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'];
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const authResponse = await this.authService.handleGitHubAuth(
        req.user,
        ipAddress,
        userAgent,
      );

      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        expiresIn: authResponse.expiresIn.toString(),
      });

      res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';
      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    return req.ip || req.socket?.remoteAddress || '';
  }
}
