import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { SubscriberQueryDto } from './dto/subscriber-query.dto';
import { ScheduleNewsletterDto } from './dto/schedule-newsletter.dto';
import { SubscriberResponseDto, SubscriberListResponseDto } from './dto/subscriber-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Role } from '../../common/constants/roles.constant';
import { Permission } from '../../common/constants/permissions.constant';
import { CurrentUser, JwtUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Newsletter')
@Controller('newsletter')
@UseGuards(RolesGuard, PermissionsGuard)
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get('subscribers')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_READ)
  @ApiOperation({ summary: 'Get all newsletter subscribers (admin only)' })
  @SwaggerResponse({
    status: 200,
    description: 'Subscribers retrieved successfully',
    type: SubscriberListResponseDto,
  })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query() query: SubscriberQueryDto) {
    return this.newsletterService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_READ)
  @ApiOperation({ summary: 'Get newsletter statistics' })
  @SwaggerResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats() {
    return this.newsletterService.getStats();
  }

  @Get('subscribers/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_READ)
  @ApiOperation({ summary: 'Get subscriber by ID' })
  @ApiParam({ name: 'id', description: 'Subscriber ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Subscriber retrieved successfully',
    type: SubscriberResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Subscriber not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletterService.findById(id);
  }

  @Post('subscribe')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter (public)' })
  @SwaggerResponse({
    status: 201,
    description: 'Subscription initiated successfully',
    type: SubscriberResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(
    @Body() subscribeDto: SubscribeDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.newsletterService.subscribe(subscribeDto, ipAddress);
  }

  @Post('unsubscribe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter (public)' })
  @SwaggerResponse({ status: 200, description: 'Unsubscribed successfully' })
  @SwaggerResponse({ status: 404, description: 'Subscriber not found' })
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeDto) {
    return this.newsletterService.unsubscribe(unsubscribeDto);
  }

  @Post('confirm/:token')
  @Public()
  @ApiOperation({ summary: 'Confirm newsletter subscription (public)' })
  @ApiParam({ name: 'token', description: 'Confirmation token' })
  @SwaggerResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
    type: SubscriberResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'Invalid or expired token' })
  async confirmSubscription(@Param('token') token: string) {
    return this.newsletterService.confirmSubscription(token);
  }

  @Delete('subscribers/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subscriber (admin only)' })
  @ApiParam({ name: 'id', description: 'Subscriber ID' })
  @SwaggerResponse({ status: 200, description: 'Subscriber deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Subscriber not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletterService.remove(id);
  }

  // ─── Newsletter Campaign Endpoints ──────────────────────────────────

  @Post('send/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a newsletter to subscribers (admin only)' })
  @ApiParam({ name: 'id', description: 'Newsletter ID' })
  @SwaggerResponse({ status: 200, description: 'Newsletter sent successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid newsletter state' })
  @SwaggerResponse({ status: 404, description: 'Newsletter not found' })
  async sendNewsletter(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletterService.sendNewsletter(id);
  }

  @Post('schedule/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a newsletter for later sending (admin only)' })
  @ApiParam({ name: 'id', description: 'Newsletter ID' })
  @SwaggerResponse({ status: 200, description: 'Newsletter scheduled successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input or newsletter state' })
  @SwaggerResponse({ status: 404, description: 'Newsletter not found' })
  async scheduleNewsletter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleNewsletterDto,
  ) {
    return this.newsletterService.scheduleNewsletter(id, new Date(dto.scheduledFor));
  }

  @Get('analytics/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_READ)
  @ApiOperation({ summary: 'Get newsletter analytics (admin only)' })
  @ApiParam({ name: 'id', description: 'Newsletter ID' })
  @SwaggerResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Newsletter not found' })
  async getAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletterService.getAnalytics(id);
  }

  @Post('test/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.NEWSLETTER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test newsletter email to admin (admin only)' })
  @ApiParam({ name: 'id', description: 'Newsletter ID' })
  @SwaggerResponse({ status: 200, description: 'Test email sent successfully' })
  @SwaggerResponse({ status: 400, description: 'Newsletter has no content' })
  @SwaggerResponse({ status: 404, description: 'Newsletter not found' })
  async sendTestEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.newsletterService.sendTestEmail(id, user.email);
  }
}
