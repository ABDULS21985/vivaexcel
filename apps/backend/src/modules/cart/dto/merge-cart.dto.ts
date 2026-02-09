import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({
    description: 'Session ID of the guest cart to merge into the authenticated user cart',
    example: 'V1StGXR8_Z5jdHi6B-myT',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
