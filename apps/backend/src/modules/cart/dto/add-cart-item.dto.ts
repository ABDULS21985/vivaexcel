import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ description: 'ID of the digital product to add to cart' })
  @IsUUID()
  digitalProductId: string;

  @ApiPropertyOptional({ description: 'ID of the product variant (if applicable)' })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}
