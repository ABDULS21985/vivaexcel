import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PushSubscriptionKeysDto {
  @ApiProperty({
    description: 'p256dh key for push encryption',
    example: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8p8REfWLk',
  })
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @ApiProperty({
    description: 'Auth secret for push encryption',
    example: 'tBHItJI5svbpC7vFrsaYAQ',
  })
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class PushSubscribeDto {
  @ApiProperty({
    description: 'Push subscription endpoint URL',
    example: 'https://fcm.googleapis.com/fcm/send/xxx',
  })
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @ApiProperty({
    description: 'Push subscription encryption keys',
    type: PushSubscriptionKeysDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;

  @ApiPropertyOptional({
    description: 'User agent string of the subscribing device',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Human-readable device name',
    example: 'Chrome on Windows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceName?: string;
}
