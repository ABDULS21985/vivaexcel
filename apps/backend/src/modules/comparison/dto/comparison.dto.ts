import {
  IsArray,
  IsUUID,
  ArrayMaxSize,
  ArrayMinSize,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComparisonDto {
  @ApiProperty({
    description: 'Array of product UUIDs to compare (2-4)',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  productIds!: string[];

  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class UpdateComparisonDto {
  @ApiProperty({ description: 'Action: add or remove a product', enum: ['add', 'remove'] })
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

export class ComparisonQueryDto {
  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class QuickCompareQueryDto {
  @ApiProperty({
    description: 'Comma-separated product UUIDs',
    example: 'uuid-1,uuid-2,uuid-3',
  })
  @IsString()
  ids!: string;

  @ApiPropertyOptional({ description: 'Session ID for guest users' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
