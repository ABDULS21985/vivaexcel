import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ContactStatus } from '../../../entities/contact.entity';

@Exclude()
export class ContactResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiPropertyOptional()
  phone?: string;

  @Expose()
  @ApiPropertyOptional()
  company?: string;

  @Expose()
  @ApiProperty()
  subject: string;

  @Expose()
  @ApiProperty()
  message: string;

  @Expose()
  @ApiProperty({ enum: ContactStatus })
  status: ContactStatus;

  @Expose()
  @ApiPropertyOptional()
  readAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  repliedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  notes?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class ContactListResponseDto {
  @ApiProperty({ type: [ContactResponseDto] })
  @Type(() => ContactResponseDto)
  items: ContactResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
