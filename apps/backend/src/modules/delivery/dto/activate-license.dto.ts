import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ActivateLicenseDto {
  @ApiPropertyOptional({ description: 'Domain to activate the license on' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ description: 'Machine identifier for activation' })
  @IsOptional()
  @IsString()
  machineId?: string;
}
