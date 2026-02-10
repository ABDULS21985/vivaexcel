import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailSequence } from './entities/email-sequence.entity';
import { EmailSequenceEnrollment } from './entities/email-sequence-enrollment.entity';
import { EmailAutomationService } from './email-automation.service';
import { EmailAutomationController } from './email-automation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailSequence, EmailSequenceEnrollment]),
  ],
  controllers: [EmailAutomationController],
  providers: [EmailAutomationService],
  exports: [EmailAutomationService],
})
export class EmailAutomationModule {}
