import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty()
  emailProductUpdates: boolean;

  @ApiProperty()
  emailWeeklyDigest: boolean;

  @ApiProperty()
  emailCommentsReplies: boolean;

  @ApiProperty()
  emailMentions: boolean;

  @ApiProperty()
  emailNewsletter: boolean;

  @ApiProperty()
  emailMarketing: boolean;

  @ApiProperty()
  profileVisibility: string;

  @ApiProperty()
  showReadingHistory: boolean;

  @ApiProperty()
  showBookmarks: boolean;

  @ApiProperty()
  allowAnalytics: boolean;

  @ApiPropertyOptional()
  language?: string;

  @ApiPropertyOptional()
  timezone?: string;
}

export class SessionResponseDto {
  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  lastAccessedAt: number;

  @ApiProperty()
  isCurrent: boolean;
}
