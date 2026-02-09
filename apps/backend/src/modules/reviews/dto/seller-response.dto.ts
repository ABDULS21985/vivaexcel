import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SellerResponseDto {
  @ApiProperty({
    description: 'Seller response to the review',
    example: 'Thank you for your feedback! We appreciate your support.',
  })
  @IsString()
  @MaxLength(2000)
  response: string;
}
