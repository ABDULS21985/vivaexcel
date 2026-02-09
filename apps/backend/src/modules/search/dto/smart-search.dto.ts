import { IsString, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SmartSearchQueryDto {
  @ApiProperty({
    description: 'Search query (supports natural language)',
    example: 'best powerpoint templates under $50',
  })
  @IsString()
  @MinLength(1)
  q: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 12;
}

export class AutocompleteQueryDto {
  @ApiProperty({
    description: 'Partial search query for autocomplete',
    example: 'excel',
  })
  @IsString()
  @MinLength(1)
  q: string;

  @ApiPropertyOptional({
    description: 'Maximum number of suggestions',
    default: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  limit?: number = 8;
}
