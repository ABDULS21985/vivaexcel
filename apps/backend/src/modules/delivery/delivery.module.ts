import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadLink } from '../../entities/download-link.entity';
import { DownloadLog } from '../../entities/download-log.entity';
import { License } from '../../entities/license.entity';
import { LicenseActivation } from '../../entities/license-activation.entity';
import { ProductUpdate } from '../../entities/product-update.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DeliveryController } from './controllers/delivery.controller';
import { LicenseController } from './controllers/license.controller';
import { ProductUpdateController } from './controllers/product-update.controller';
import { DownloadService } from './services/download.service';
import { LicenseService } from './services/license.service';
import { ProductUpdateService } from './services/product-update.service';
import { DeliveryRepository } from './delivery.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DownloadLink,
      DownloadLog,
      License,
      LicenseActivation,
      ProductUpdate,
      DigitalProduct,
      DigitalProductFile,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [DeliveryController, LicenseController, ProductUpdateController],
  providers: [DownloadService, LicenseService, ProductUpdateService, DeliveryRepository],
  exports: [DownloadService, LicenseService, ProductUpdateService],
})
export class DeliveryModule {}
