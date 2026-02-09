import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CartQueryDto {
  @ApiPropertyOptional({ description: 'Session ID for guest cart identification' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
