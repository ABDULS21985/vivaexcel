import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Receive product update emails' })
  @IsOptional()
  @IsBoolean()
  emailProductUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Receive weekly digest emails' })
  @IsOptional()
  @IsBoolean()
  emailWeeklyDigest?: boolean;

  @ApiPropertyOptional({ description: 'Receive comment/reply notification emails' })
  @IsOptional()
  @IsBoolean()
  emailCommentsReplies?: boolean;

  @ApiPropertyOptional({ description: 'Receive mention notification emails' })
  @IsOptional()
  @IsBoolean()
  emailMentions?: boolean;

  @ApiPropertyOptional({ description: 'Receive newsletter emails' })
  @IsOptional()
  @IsBoolean()
  emailNewsletter?: boolean;

  @ApiPropertyOptional({ description: 'Receive marketing emails' })
  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;
}

export class UpdatePrivacySettingsDto {
  @ApiPropertyOptional({
    description: 'Profile visibility',
    enum: ['public', 'private'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'private'])
  profileVisibility?: string;

  @ApiPropertyOptional({ description: 'Show reading history on profile' })
  @IsOptional()
  @IsBoolean()
  showReadingHistory?: boolean;

  @ApiPropertyOptional({ description: 'Show bookmarks on profile' })
  @IsOptional()
  @IsBoolean()
  showBookmarks?: boolean;

  @ApiPropertyOptional({ description: 'Allow usage analytics' })
  @IsOptional()
  @IsBoolean()
  allowAnalytics?: boolean;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: 'Preferred language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
