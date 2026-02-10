import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestPurchaseDto {
  @ApiProperty({ example: 'uuid-of-digital-product' })
  @IsUUID()
  digitalProductId: string;

  @ApiPropertyOptional({ example: 'We need this template for the Q2 presentation' })
  @IsOptional()
  @IsString()
  requestNote?: string;

  @ApiPropertyOptional({ example: 5, description: 'Number of seats to purchase' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  seatCount?: number;
}
