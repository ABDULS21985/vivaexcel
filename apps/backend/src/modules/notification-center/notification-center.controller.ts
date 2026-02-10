import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationCenterService } from './notification-center.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PushSubscribeDto } from './dto/push-subscribe.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.constant';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from './enums/notification.enums';

@ApiTags('Notification Center')
@Controller('notification-center')
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class NotificationCenterController {
  constructor(
    private readonly notificationCenterService: NotificationCenterService,
  ) {}

  // ──────────────────────────────────────────────
  //  Get notifications (paginated)
  // ──────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get notifications for the authenticated user' })
  @SwaggerResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannel })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'priority', 'type'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationCenterService.getNotifications(userId, query);
  }

  // ──────────────────────────────────────────────
  //  Get grouped notifications
  // ──────────────────────────────────────────────

  @Get('grouped')
  @ApiOperation({ summary: 'Get grouped notifications for the authenticated user' })
  @SwaggerResponse({
    status: 200,
    description: 'Grouped notifications retrieved successfully',
  })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getGroupedNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationCenterService.getGroupedNotifications(userId, query);
  }

  // ──────────────────────────────────────────────
  //  Get unread count
  // ──────────────────────────────────────────────

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @SwaggerResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    return this.notificationCenterService.getUnreadCount(userId);
  }

  // ──────────────────────────────────────────────
  //  Mark single notification as read
  // ──────────────────────────────────────────────

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @SwaggerResponse({ status: 200, description: 'Notification marked as read' })
  @SwaggerResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationCenterService.markAsRead(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Mark all notifications as read
  // ──────────────────────────────────────────────

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @SwaggerResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationCenterService.markAllAsRead(userId);
  }

  // ──────────────────────────────────────────────
  //  Archive notification
  // ──────────────────────────────────────────────

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @SwaggerResponse({ status: 200, description: 'Notification archived' })
  @SwaggerResponse({ status: 404, description: 'Notification not found' })
  async archiveNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationCenterService.archiveNotification(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Dismiss notification
  // ──────────────────────────────────────────────

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @SwaggerResponse({ status: 200, description: 'Notification dismissed' })
  @SwaggerResponse({ status: 404, description: 'Notification not found' })
  async dismissNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationCenterService.dismissNotification(id, userId);
  }

  // ──────────────────────────────────────────────
  //  Get user preferences
  // ──────────────────────────────────────────────

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences for the authenticated user' })
  @SwaggerResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
  })
  async getUserPreferences(@CurrentUser('sub') userId: string) {
    return this.notificationCenterService.getUserPreferences(userId);
  }

  // ──────────────────────────────────────────────
  //  Update user preferences
  // ──────────────────────────────────────────────

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @SwaggerResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  async updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return this.notificationCenterService.updatePreferences(userId, dto);
  }

  // ──────────────────────────────────────────────
  //  Push subscription: subscribe
  // ──────────────────────────────────────────────

  @Post('push/subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @SwaggerResponse({
    status: 201,
    description: 'Push subscription created successfully',
  })
  async subscribePush(
    @CurrentUser('sub') userId: string,
    @Body() dto: PushSubscribeDto,
  ) {
    return this.notificationCenterService.subscribePush(userId, dto);
  }

  // ──────────────────────────────────────────────
  //  Push subscription: unsubscribe
  // ──────────────────────────────────────────────

  @Delete('push/unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['endpoint'],
      properties: {
        endpoint: {
          type: 'string',
          description: 'The push subscription endpoint to unsubscribe',
        },
      },
    },
  })
  @SwaggerResponse({ status: 200, description: 'Push subscription deactivated' })
  @SwaggerResponse({ status: 404, description: 'Push subscription not found' })
  async unsubscribePush(
    @CurrentUser('sub') userId: string,
    @Body('endpoint') endpoint: string,
  ) {
    await this.notificationCenterService.unsubscribePush(userId, endpoint);
    return { message: 'Push subscription deactivated' };
  }

  // ──────────────────────────────────────────────
  //  Push: test notification
  // ──────────────────────────────────────────────

  @Post('push/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test push notification to the authenticated user' })
  @SwaggerResponse({
    status: 200,
    description: 'Test push notification sent',
  })
  async testPush(@CurrentUser('sub') userId: string) {
    await this.notificationCenterService.sendPushNotification(userId, {
      title: 'Test Notification',
      body: 'This is a test push notification. If you see this, push notifications are working!',
      data: { test: true },
    });
    return { message: 'Test push notification sent' };
  }

  // ──────────────────────────────────────────────
  //  Admin: send notification to a specific user
  // ──────────────────────────────────────────────

  @Post('send')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send notification to a specific user (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'notification'],
      properties: {
        userId: { type: 'string', format: 'uuid' },
        notification: { $ref: '#/components/schemas/CreateNotificationDto' },
      },
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'Notification sent successfully',
  })
  @SwaggerResponse({ status: 403, description: 'Insufficient permissions' })
  async sendNotification(
    @Body('userId', ParseUUIDPipe) targetUserId: string,
    @Body('notification') dto: CreateNotificationDto,
  ) {
    return this.notificationCenterService.sendNotification(targetUserId, dto);
  }

  // ──────────────────────────────────────────────
  //  Admin: broadcast notification to multiple users
  // ──────────────────────────────────────────────

  @Post('broadcast')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Broadcast notification to multiple users (admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userIds', 'notification'],
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of user IDs to send notification to',
        },
        notification: { $ref: '#/components/schemas/CreateNotificationDto' },
      },
    },
  })
  @SwaggerResponse({
    status: 201,
    description: 'Bulk notification sent successfully',
  })
  @SwaggerResponse({ status: 403, description: 'Insufficient permissions' })
  async broadcastNotification(
    @Body('userIds') userIds: string[],
    @Body('notification') dto: CreateNotificationDto,
  ) {
    return this.notificationCenterService.sendBulkNotification(userIds, dto);
  }
}
