import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
  MaxLength,
  IsUrl,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../enums/notification.enums';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.ORDER,
    description: 'Type of notification',
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.IN_APP,
    description: 'Delivery channel',
  })
  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @ApiProperty({
    example: 'Your order has been shipped',
    description: 'Notification title',
  })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'Your order #12345 has been shipped and is on its way.',
    description: 'Notification body',
  })
  @IsString()
  body!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/orders/12345',
    description: 'URL for the notification action',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  actionUrl?: string;

  @ApiPropertyOptional({
    example: 'View Order',
    description: 'Label for the action button',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionLabel?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/shipped.png',
    description: 'Image URL for the notification',
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
    description: 'Notification priority',
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    example: { orderId: '12345', trackingNumber: 'TRACK123' },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Notification expiration date',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
