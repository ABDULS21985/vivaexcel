import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import { SubscriberStatus } from '../../../entities/newsletter-subscriber.entity';

export class SubscriberQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by email or name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SubscriberStatus })
  @IsOptional()
  @IsEnum(SubscriberStatus)
  status?: SubscriberStatus;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;
}
