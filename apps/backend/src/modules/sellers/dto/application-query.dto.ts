import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { SellerApplicationStatus } from '../../../entities/seller-application.entity';

export class ApplicationQueryDto extends CursorPaginationQueryDto {
  @ApiPropertyOptional({ enum: SellerApplicationStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(SellerApplicationStatus)
  status?: SellerApplicationStatus;
}
