import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { SubscriberStatus } from '../../../entities/newsletter-subscriber.entity';

@Exclude()
export class SubscriberResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiPropertyOptional()
  name?: string;

  @Expose()
  @ApiProperty({ enum: SubscriberStatus })
  status: SubscriberStatus;

  @Expose()
  @ApiPropertyOptional()
  confirmedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  unsubscribedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class SubscriberListResponseDto {
  @ApiProperty({ type: [SubscriberResponseDto] })
  @Type(() => SubscriberResponseDto)
  items: SubscriberResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
