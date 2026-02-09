import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class Setup2FADto {
  @ApiPropertyOptional({
    description: 'Optional device name for identifying the 2FA setup',
    example: 'My iPhone',
  })
  @IsString({ message: 'Device name must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Device name must not exceed 100 characters' })
  deviceName?: string;
}

export class Setup2FAResponseDto {
  @ApiProperty({
    description: 'TOTP secret for manual entry in authenticator app',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret!: string;

  @ApiProperty({
    description: 'QR code as data URL for scanning with authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  qrCode!: string;

  @ApiProperty({
    description: 'Recovery codes for account access if 2FA device is lost',
    example: ['ABC123', 'DEF456', 'GHI789'],
    type: [String],
  })
  recoveryCodes!: string[];
}
