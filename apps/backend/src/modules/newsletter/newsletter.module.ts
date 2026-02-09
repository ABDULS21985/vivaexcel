import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterRepository } from './newsletter.repository';
import { NewsletterSubscriber } from '../../entities/newsletter-subscriber.entity';
import { Newsletter } from './entities/newsletter.entity';
import { NewsletterScheduler } from './newsletter.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscriber, Newsletter])],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterRepository, NewsletterScheduler],
  exports: [NewsletterService, NewsletterRepository],
})
export class NewsletterModule {}
