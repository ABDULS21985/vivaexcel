import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../../entities/user-settings.entity';
import { UpdateNotificationSettingsDto, UpdatePrivacySettingsDto, UpdatePreferencesDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
  ) {}

  async getSettings(userId: string): Promise<SettingsResponseDto> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default settings for user
      settings = this.settingsRepository.create({ userId });
      settings = await this.settingsRepository.save(settings);
    }

    return this.mapToResponse(settings);
  }

  async updateNotifications(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.getOrCreate(userId);
    Object.assign(settings, dto);
    const updated = await this.settingsRepository.save(settings);
    return this.mapToResponse(updated);
  }

  async updatePrivacy(
    userId: string,
    dto: UpdatePrivacySettingsDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.getOrCreate(userId);
    Object.assign(settings, dto);
    const updated = await this.settingsRepository.save(settings);
    return this.mapToResponse(updated);
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.getOrCreate(userId);
    Object.assign(settings, dto);
    const updated = await this.settingsRepository.save(settings);
    return this.mapToResponse(updated);
  }

  private async getOrCreate(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ userId });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  private mapToResponse(settings: UserSettings): SettingsResponseDto {
    return {
      emailProductUpdates: settings.emailProductUpdates,
      emailWeeklyDigest: settings.emailWeeklyDigest,
      emailCommentsReplies: settings.emailCommentsReplies,
      emailMentions: settings.emailMentions,
      emailNewsletter: settings.emailNewsletter,
      emailMarketing: settings.emailMarketing,
      profileVisibility: settings.profileVisibility,
      showReadingHistory: settings.showReadingHistory,
      showBookmarks: settings.showBookmarks,
      allowAnalytics: settings.allowAnalytics,
      language: settings.language,
      timezone: settings.timezone,
    };
  }
}
