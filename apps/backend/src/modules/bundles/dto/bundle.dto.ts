import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomBundleDto {
  @ApiProperty({
    description: 'Array of product UUIDs for the bundle (minimum 2)',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  productIds!: string[];

  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class UpdateCustomBundleDto {
  @ApiProperty({
    description: 'Action: add or remove a product',
    enum: ['add', 'remove'],
  })
  @IsIn(['add', 'remove'])
  action!: 'add' | 'remove';

  @ApiProperty({ description: 'Product UUID to add or remove' })
  @IsUUID('4')
  productId!: string;

  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class BundleQueryDto {
  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
