import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'javascript' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Articles about JavaScript programming' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
