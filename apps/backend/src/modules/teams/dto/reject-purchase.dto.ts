import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectPurchaseDto {
  @ApiProperty({ example: 'Over budget for this month. Please resubmit next month.' })
  @IsString()
  approvalNote: string;
}
