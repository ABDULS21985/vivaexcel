import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great article! Very helpful.' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-comment' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Required for guest comments' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorName?: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Required for guest comments' })
  @IsOptional()
  @IsEmail()
  authorEmail?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  authorWebsite?: string;
}
