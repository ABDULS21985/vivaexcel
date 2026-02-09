import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRevisionDto {
  @ApiPropertyOptional({
    description: 'Short description of the changes made',
    example: 'Updated introduction paragraph',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  changeDescription?: string;
}
