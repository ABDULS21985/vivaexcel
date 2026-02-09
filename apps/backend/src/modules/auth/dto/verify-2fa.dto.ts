import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({
    description: '6-digit TOTP token from authenticator app',
    example: '123456',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  token!: string;
}

export class Verify2FALoginDto {
  @ApiProperty({
    description: '6-digit TOTP token from authenticator app or recovery code',
    example: '123456',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;

  @ApiPropertyOptional({
    description: 'Set to true if using a recovery code instead of TOTP',
    example: false,
  })
  @IsOptional()
  isRecoveryCode?: boolean;
}
