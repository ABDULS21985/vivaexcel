import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvitation } from './entities/team-invitation.entity';
import { TeamPurchase } from './entities/team-purchase.entity';
import { SharedLibraryItem } from './entities/shared-library-item.entity';
import { TeamLicense } from './entities/team-license.entity';
import { VolumeDiscount } from './entities/volume-discount.entity';

// Services
import { TeamsService } from './services/teams.service';
import { TeamMembersService } from './services/team-members.service';
import { TeamPurchasesService } from './services/team-purchases.service';
import { SharedLibraryService } from './services/shared-library.service';
import { TeamLicensesService } from './services/team-licenses.service';
import { VolumeDiscountService } from './services/volume-discount.service';
import { BudgetService } from './services/budget.service';
import { SsoService } from './services/sso.service';

// Controllers
import { TeamsController } from './controllers/teams.controller';
import { TeamMembersController } from './controllers/team-members.controller';
import { TeamPurchasesController } from './controllers/team-purchases.controller';
import { SharedLibraryController } from './controllers/shared-library.controller';
import { TeamLicensesController } from './controllers/team-licenses.controller';
import { VolumeDiscountsController } from './controllers/volume-discounts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Team,
      TeamMember,
      TeamInvitation,
      TeamPurchase,
      SharedLibraryItem,
      TeamLicense,
      VolumeDiscount,
    ]),
  ],
  controllers: [
    TeamsController,
    TeamMembersController,
    TeamPurchasesController,
    SharedLibraryController,
    TeamLicensesController,
    VolumeDiscountsController,
  ],
  providers: [
    TeamsService,
    TeamMembersService,
    TeamPurchasesService,
    SharedLibraryService,
    TeamLicensesService,
    VolumeDiscountService,
    BudgetService,
    SsoService,
  ],
  exports: [
    TeamsService,
    TeamMembersService,
    TeamPurchasesService,
    SharedLibraryService,
    TeamLicensesService,
    VolumeDiscountService,
    BudgetService,
  ],
})
export class TeamsModule {}
