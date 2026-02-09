import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ServiceDeliverableResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string | null;

  @Expose()
  @ApiProperty()
  serviceId: string;

  @Expose()
  @ApiProperty()
  displayOrder: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class ServiceDeliverableListResponseDto {
  @ApiProperty({ type: [ServiceDeliverableResponseDto] })
  @Type(() => ServiceDeliverableResponseDto)
  items: ServiceDeliverableResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
