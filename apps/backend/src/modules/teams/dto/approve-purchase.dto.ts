import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ApprovePurchaseDto {
  @ApiPropertyOptional({ example: 'Approved for Q2 budget' })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
