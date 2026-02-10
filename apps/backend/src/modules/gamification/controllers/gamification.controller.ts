import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GamificationService } from '../services/gamification.service';
import {
  AchievementsQueryDto,
  LeaderboardQueryDto,
  ActivityQueryDto,
} from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
  ) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user gamification profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.gamificationService.getProfile(userId);
  }

  @Get('achievements')
  @Public()
  @ApiOperation({ summary: 'List all achievements with optional user progress' })
  async getAchievements(
    @Query() query: AchievementsQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.gamificationService.getAllAchievements(query, userId);
  }

  @Get('achievements/:slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get achievement detail with user progress' })
  @ApiParam({ name: 'slug', description: 'Achievement slug' })
  async getAchievementDetail(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.gamificationService.getAchievementDetail(slug, userId);
  }

  @Get('leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get leaderboard rankings' })
  async getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.gamificationService.getLeaderboard(query);
  }

  @Get('activity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get XP activity feed' })
  async getActivity(
    @CurrentUser('sub') userId: string,
    @Query() query: ActivityQueryDto,
  ) {
    return this.gamificationService.getActivity(userId, query);
  }

  @Post('streak/freeze')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use a streak freeze to protect your streak' })
  async freezeStreak(@CurrentUser('sub') userId: string) {
    return this.gamificationService.freezeStreak(userId);
  }
}
