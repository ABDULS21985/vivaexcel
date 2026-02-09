import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ScheduleNewsletterDto {
  @ApiProperty({
    description: 'Date and time to send the newsletter (ISO 8601)',
    example: '2026-03-01T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledFor: string;
}
