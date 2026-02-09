import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name!: string;

  @ApiProperty({
    description: 'Whether user email is verified',
    example: true,
  })
  emailVerified!: boolean;

  @ApiProperty({
    description: 'Whether 2FA is enabled for the user',
    example: false,
  })
  twoFactorEnabled!: boolean;

  @ApiPropertyOptional({
    description: 'User profile picture URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'User roles',
    example: ['admin'],
  })
  roles!: string[];
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}

export class Auth2FARequiredResponseDto {
  @ApiProperty({
    description: 'Indicates 2FA is required to complete login',
    example: true,
  })
  requires2FA!: boolean;

  @ApiProperty({
    description: 'Temporary token for 2FA verification',
    example: 'temp_2fa_abc123...',
  })
  tempToken!: string;

  @ApiProperty({
    description: 'Temporary token expiration in seconds',
    example: 300,
  })
  expiresIn!: number;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message!: string;
}
