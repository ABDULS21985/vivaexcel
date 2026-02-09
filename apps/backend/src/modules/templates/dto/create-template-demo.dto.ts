import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsUrl, Min, MaxLength } from 'class-validator';

export class CreateTemplateDemoDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsUrl()
  demoUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  screenshotUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
