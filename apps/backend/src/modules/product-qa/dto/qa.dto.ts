import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QASortBy {
  NEWEST = 'newest',
  POPULAR = 'popular',
  UNANSWERED = 'unanswered',
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'Product ID to ask a question about' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Question content', example: 'Does this template support dark mode?' })
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class CreateAnswerDto {
  @ApiProperty({ description: 'Answer content', example: 'Yes, it includes both light and dark mode variants.' })
  @IsString()
  @MaxLength(5000)
  content: string;
}

export class QAQueryDto {
  @ApiProperty({ description: 'Product ID to get questions for' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: QASortBy,
    description: 'Sort order for results',
    default: QASortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(QASortBy)
  sortBy?: QASortBy = QASortBy.NEWEST;
}
