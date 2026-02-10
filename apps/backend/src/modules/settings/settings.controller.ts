import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import {
  UpdateNotificationSettingsDto,
  UpdatePrivacySettingsDto,
  UpdatePreferencesDto,
} from './dto/update-settings.dto';
import { SettingsResponseDto, SessionResponseDto } from './dto/settings-response.dto';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionService } from '../auth/services/session.service';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async getSettings(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.getSettings(user.userId);
  }

  @Patch('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updateNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.updateNotifications(user.userId, dto);
  }

  @Patch('privacy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updatePrivacy(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePrivacySettingsDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.updatePrivacy(user.userId, dto);
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updatePreferences(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<SettingsResponseDto> {
    return this.settingsService.updatePreferences(user.userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get active sessions for current user' })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  async getSessions(
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionService.getUserSessions(user.userId);
    const currentIp = this.getClientIP(req);
    const currentUa = req.headers['user-agent'] || '';

    return sessions.map((session) => ({
      ipAddress: session.ipAddress || 'Unknown',
      userAgent: session.userAgent || 'Unknown',
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt,
      isCurrent:
        session.ipAddress === currentIp &&
        session.userAgent === currentUa,
    }));
  }

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
