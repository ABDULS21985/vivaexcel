import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RevokeLicenseDto {
  @ApiProperty({ description: 'Reason for revoking the license' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
