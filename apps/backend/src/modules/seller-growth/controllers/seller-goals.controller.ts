import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../../../common/decorators/current-user.decorator';
import { SellerGoal } from '../../../entities/seller-goal.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { CreateGoalDto, UpdateGoalDto, GoalQueryDto } from '../dto/seller-growth.dto';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@ApiTags('Seller Growth - Goals')
@Controller('seller-growth/goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SellerGoalsController {
  constructor(
    @InjectRepository(SellerGoal)
    private readonly goalRepo: Repository<SellerGoal>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new seller goal' })
  async createGoal(
    @CurrentUser() user: JwtUserPayload,
    @Body() dto: CreateGoalDto,
  ): Promise<ApiResponse<SellerGoal>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const goal = this.goalRepo.create({
      sellerId: seller.id,
      type: dto.type,
      targetValue: dto.targetValue,
      deadline: new Date(dto.deadline),
      title: dto.title,
    });

    const saved = await this.goalRepo.save(goal);

    return {
      status: 'success',
      message: 'Goal created successfully',
      data: saved,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List current seller goals' })
  async listGoals(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: GoalQueryDto,
  ): Promise<ApiResponse<SellerGoal[]>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const where: Record<string, any> = { sellerId: seller.id };
    if (query.status) where.status = query.status;

    const goals = await this.goalRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return {
      status: 'success',
      message: 'Goals retrieved successfully',
      data: goals,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a seller goal' })
  async updateGoal(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<ApiResponse<SellerGoal>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const goal = await this.goalRepo.findOne({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.sellerId !== seller.id) throw new ForbiddenException('Goal does not belong to this seller');

    if (dto.currentValue !== undefined) goal.currentValue = dto.currentValue;
    if (dto.status !== undefined) goal.status = dto.status;
    if (dto.title !== undefined) goal.title = dto.title;

    const updated = await this.goalRepo.save(goal);

    return {
      status: 'success',
      message: 'Goal updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a seller goal' })
  async deleteGoal(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const goal = await this.goalRepo.findOne({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.sellerId !== seller.id) throw new ForbiddenException('Goal does not belong to this seller');

    await this.goalRepo.softRemove(goal);

    return {
      status: 'success',
      message: 'Goal deleted successfully',
    };
  }
}
