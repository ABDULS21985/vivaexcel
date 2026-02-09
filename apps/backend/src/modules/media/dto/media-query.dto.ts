import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import { MediaType } from '../../../entities/media.entity';

export class MediaQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by filename, title, or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ description: 'Filter by folder ID' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;
}
