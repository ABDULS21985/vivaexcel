import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import { ContactStatus } from '../../../entities/contact.entity';

export class ContactQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or subject' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}
