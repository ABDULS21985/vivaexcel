import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMemberSpendLimitDto {
  @ApiProperty({ example: 500.0, description: 'Monthly spend limit. Null to remove limit.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  spendLimit: number | null;
}
