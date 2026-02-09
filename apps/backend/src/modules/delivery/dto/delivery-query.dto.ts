import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';

export class DeliveryQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by product title or order number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. active, expired, revoked, exhausted)' })
  @IsOptional()
  @IsString()
  status?: string;
}
