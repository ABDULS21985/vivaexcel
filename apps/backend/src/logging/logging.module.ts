import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { getPinoConfig } from './pino.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    PinoLoggerModule.forRoot(getPinoConfig()),
  ],
  providers: [LoggerService],
  exports: [LoggerService, PinoLoggerModule],
})
export class LoggingModule {}
