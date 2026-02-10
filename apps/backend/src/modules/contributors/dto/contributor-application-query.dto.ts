import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ContributorApplicationStatus } from '../../../entities/contributor-application.entity';

export class ContributorApplicationQueryDto extends CursorPaginationQueryDto {
  @ApiPropertyOptional({ enum: ContributorApplicationStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ContributorApplicationStatus)
  status?: ContributorApplicationStatus;
}
