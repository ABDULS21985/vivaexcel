import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsObject,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  NotificationChannel,
  EmailDigestFrequency,
} from '../enums/notification.enums';
import { NotificationCategories } from '../entities/notification-preference.entity';

export class UpdatePreferenceDto {
  @ApiPropertyOptional({
    enum: NotificationChannel,
    description: 'Preferred notification channel',
  })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({
    description: 'Category preferences (key: category name, value: enabled)',
    example: {
      orders: true,
      reviews: true,
      product_updates: true,
      promotions: false,
      community: true,
      achievements: true,
      price_drops: true,
      back_in_stock: true,
      newsletter: false,
      security: true,
    },
  })
  @IsOptional()
  @IsObject()
  categories?: Partial<NotificationCategories>;

  @ApiPropertyOptional({
    description: 'Enable or disable quiet hours',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Quiet hours start time (HH:mm format)',
    example: '22:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursStart must be in HH:mm format (e.g. 22:00)',
  })
  quietHoursStart?: string;

  @ApiPropertyOptional({
    description: 'Quiet hours end time (HH:mm format)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursEnd must be in HH:mm format (e.g. 08:00)',
  })
  quietHoursEnd?: string;

  @ApiPropertyOptional({
    description: 'User timezone (IANA format)',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({
    enum: EmailDigestFrequency,
    description: 'Email digest frequency',
    default: EmailDigestFrequency.INSTANT,
  })
  @IsOptional()
  @IsEnum(EmailDigestFrequency)
  emailDigest?: EmailDigestFrequency;
}
