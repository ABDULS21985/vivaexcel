import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
    imports: [MediaModule],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule { }
