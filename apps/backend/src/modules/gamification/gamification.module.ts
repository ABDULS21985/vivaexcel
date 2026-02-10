import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './controllers/gamification.controller';
import { GamificationService } from './services/gamification.service';
import { LeaderboardService } from './services/leaderboard.service';
import { GamificationRepository } from './gamification.repository';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserXP } from './entities/user-xp.entity';
import { XPTransaction } from './entities/xp-transaction.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Review } from '../../entities/review.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
      UserAchievement,
      UserXP,
      XPTransaction,
      LeaderboardEntry,
      Order,
      OrderItem,
      Review,
      SellerProfile,
      DigitalProduct,
    ]),
    NotificationsModule,
  ],
  controllers: [GamificationController],
  providers: [GamificationService, LeaderboardService, GamificationRepository],
  exports: [GamificationService],
})
export class GamificationModule {}
