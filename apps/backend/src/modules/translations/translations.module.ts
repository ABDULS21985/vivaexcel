import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { ContentTranslation } from './entities/content-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentTranslation])],
  controllers: [TranslationsController],
  providers: [TranslationsService],
  exports: [TranslationsService],
})
export class TranslationsModule {}
