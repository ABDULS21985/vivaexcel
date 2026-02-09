import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ example: 'subscriber@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ type: [String], example: ['tech', 'news'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UnsubscribeDto {
  @ApiProperty({ example: 'subscriber@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Unsubscribe token for verification' })
  @IsOptional()
  @IsString()
  token?: string;
}
