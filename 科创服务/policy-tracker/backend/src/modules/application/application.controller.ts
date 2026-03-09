import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationService, ApplicationStatus } from './application.service';
import { ApplicationTask } from '../../entities/application-task.entity';

@ApiTags('申报管理')
@Controller('applications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: '创建申报任务' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  async create(@Body() data: Partial<ApplicationTask>) {
    const application = await this.applicationService.create(data);
    return {
      data: application,
      message: '创建成功',
    };
  }

  @Get()
  @ApiOperation({ summary: '获取申报任务列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findAll(
    @Query('enterpriseId') enterpriseId: string,
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.applicationService.findAll({
      enterpriseId,
      status,
      page,
      limit,
    });
    return {
      data: result,
      message: 'success',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取申报任务详情' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    const application = await this.applicationService.findOne(id);
    return {
      data: application,
      message: 'success',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新申报任务' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: Partial<ApplicationTask>) {
    const application = await this.applicationService.update(id, data);
    return {
      data: application,
      message: '更新成功',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除申报任务' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.applicationService.remove(id);
  }

  @Post(':id/materials/:name')
  @ApiOperation({ summary: '更新材料状态' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  async updateMaterialStatus(
    @Param('id') id: string,
    @Param('name') materialName: string,
    @Body('status') status: string,
    @Body('fileUrl') fileUrl?: string,
  ) {
    const application = await this.applicationService.updateMaterialStatus(
      id,
      materialName,
      status,
      fileUrl,
    );
    return {
      data: application,
      message: '更新成功',
    };
  }

  @Get('upcoming/deadlines')
  @ApiOperation({ summary: '获取即将截止的申报任务' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getUpcomingDeadlines(
    @Query('enterpriseId') enterpriseId: string,
    @Query('days') days: number = 7,
  ) {
    const applications = await this.applicationService.getUpcomingDeadlines(
      enterpriseId,
      days,
    );
    return {
      data: applications,
      message: 'success',
    };
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: '获取申报统计' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getStatistics(@Query('enterpriseId') enterpriseId: string) {
    const statistics = await this.applicationService.getStatistics(enterpriseId);
    return {
      data: statistics,
      message: 'success',
    };
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建申报任务' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  async batchCreate(
    @Body('enterpriseId') enterpriseId: string,
    @Body('policyIds') policyIds: string[],
  ) {
    const applications = await this.applicationService.batchCreate(
      enterpriseId,
      policyIds,
    );
    return {
      data: applications,
      message: `成功创建 ${applications.length} 个申报任务`,
    };
  }
}