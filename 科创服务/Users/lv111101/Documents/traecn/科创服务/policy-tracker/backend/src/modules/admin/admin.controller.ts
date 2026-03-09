import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, UserStatus } from '../../entities/user.entity';

@ApiTags('管理后台')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(role: string) {
    if (role !== 'admin') {
      throw new ForbiddenException('仅管理员可访问');
    }
  }

  @Get('dashboard')
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getDashboard(@CurrentUser('role') role: string) {
    this.checkAdmin(role);
    return this.adminService.getDashboardStats();
  }

  @Get('trends')
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getTrends(
    @CurrentUser('role') role: string,
    @Query('days') days?: number,
  ) {
    this.checkAdmin(role);
    return this.adminService.getTrendData(days ? parseInt(days as unknown as string, 10) : 30);
  }

  @Get('users')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getUsers(
    @CurrentUser('role') role: string,
    @Query('keyword') keyword?: string,
    @Query('role') userRole?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.checkAdmin(role);
    return this.adminService.getUserList({
      keyword,
      role: userRole,
      status,
      page: page ? parseInt(page as unknown as string, 10) : 1,
      limit: limit ? parseInt(limit as unknown as string, 10) : 10,
    });
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  async updateUserStatus(
    @CurrentUser('role') role: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: UserStatus,
  ) {
    this.checkAdmin(role);
    return this.adminService.updateUserStatus(id, status);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '删除成功' })
  async deleteUser(
    @CurrentUser('role') role: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    this.checkAdmin(role);
    await this.adminService.deleteUser(id);
  }

  @Get('enterprises')
  @ApiOperation({ summary: '获取企业列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getEnterprises(
    @CurrentUser('role') role: string,
    @Query('keyword') keyword?: string,
    @Query('scale') scale?: string,
    @Query('industry') industry?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.checkAdmin(role);
    return this.adminService.getEnterpriseList({
      keyword,
      scale,
      industry,
      page: page ? parseInt(page as unknown as string, 10) : 1,
      limit: limit ? parseInt(limit as unknown as string, 10) : 10,
    });
  }

  @Get('applications/stats')
  @ApiOperation({ summary: '获取申报统计' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getApplicationStats(@CurrentUser('role') role: string) {
    this.checkAdmin(role);
    return this.adminService.getApplicationStats();
  }

  @Get('system/health')
  @ApiOperation({ summary: '系统健康检查' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getSystemHealth(@CurrentUser('role') role: string) {
    this.checkAdmin(role);
    return this.adminService.getSystemHealth();
  }
}
