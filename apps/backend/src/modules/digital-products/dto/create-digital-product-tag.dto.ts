import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDigitalProductTagDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'react' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Products related to React development' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
