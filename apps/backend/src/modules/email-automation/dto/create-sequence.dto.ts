import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmailSequenceTrigger } from '../enums/email-automation.enums';

export class SequenceStepDto {
  @ApiProperty({ description: 'Step number (1-based order)', example: 1 })
  @IsNumber()
  @Min(1)
  stepNumber: number;

  @ApiProperty({
    description: 'Email subject line',
    example: 'Welcome to our platform!',
  })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    description: 'Email template name',
    example: 'welcome-day-0',
  })
  @IsString()
  @MaxLength(255)
  templateName: string;

  @ApiProperty({
    description: 'Delay in minutes before sending this step',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  delayMinutes: number;

  @ApiPropertyOptional({
    description: 'Condition to evaluate before sending (e.g., has_not_purchased)',
    example: 'has_not_purchased',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  condition?: string;
}

export class CreateSequenceDto {
  @ApiProperty({
    description: 'Sequence name',
    example: 'Welcome Series',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Sequence description',
    example: 'Onboarding email sequence for new users',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: EmailSequenceTrigger,
    description: 'Event that triggers enrollment in this sequence',
    example: EmailSequenceTrigger.SIGNUP,
  })
  @IsEnum(EmailSequenceTrigger)
  trigger: EmailSequenceTrigger;

  @ApiProperty({
    description: 'Ordered list of email steps in the sequence',
    type: [SequenceStepDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  steps: SequenceStepDto[];

  @ApiPropertyOptional({
    description: 'Whether the sequence is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
