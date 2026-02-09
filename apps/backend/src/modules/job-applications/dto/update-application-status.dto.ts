import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApplicationStatus } from '../../../entities/job-application.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Strong candidate, schedule interview' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateApplicationNotesDto {
  @ApiProperty({ example: 'Discussed salary expectations in phone screen' })
  @IsString()
  @MaxLength(2000)
  notes: string;
}
