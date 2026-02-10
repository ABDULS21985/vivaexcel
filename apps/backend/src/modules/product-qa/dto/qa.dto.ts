import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QASortBy } from '../enums/qa.enums';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The ID of the product to ask a question about' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'The question content', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class CreateAnswerDto {
  @ApiProperty({ description: 'The answer content', maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  content: string;
}

export class QAQueryDto {
  @ApiProperty({ description: 'The product ID to get questions for' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Sort order for questions',
    enum: QASortBy,
    default: QASortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(QASortBy)
  sortBy: QASortBy = QASortBy.NEWEST;
}
