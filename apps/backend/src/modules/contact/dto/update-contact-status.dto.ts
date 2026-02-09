import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContactStatus } from '../../../entities/contact.entity';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus })
  @IsEnum(ContactStatus)
  status: ContactStatus;

  @ApiPropertyOptional({ example: 'Replied via email on 2024-01-15' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
