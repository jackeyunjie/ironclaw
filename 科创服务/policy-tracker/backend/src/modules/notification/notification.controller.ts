import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('通知管理')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationService.getUserNotifications(userId, {
      unreadOnly,
      limit: limit ? parseInt(limit as unknown as string, 10) : 20,
      offset: offset ? parseInt(offset as unknown as string, 10) : 0,
    });
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '标记成功' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Put('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: HttpStatus.OK, description: '标记成功' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { message: '所有通知已标记为已读' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '删除成功' })
  async deleteNotification(@Param('id', ParseUUIDPipe) id: string) {
    await this.notificationService.deleteNotification(id);
  }
}
