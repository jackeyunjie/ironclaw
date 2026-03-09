import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import {
  CreateEnterpriseDto,
  UpdateEnterpriseDto,
  EnterpriseQueryDto,
  EnterpriseResponseDto,
} from '../../dto/enterprise.dto';
import { Enterprise } from '../../entities/enterprise.entity';

@ApiTags('企业管理')
@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Post()
  @ApiOperation({ summary: '创建企业' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '企业创建成功',
    type: EnterpriseResponseDto,
  })
  async create(
    @Body() createEnterpriseDto: CreateEnterpriseDto,
  ): Promise<Enterprise> {
    return this.enterpriseService.create(createEnterpriseDto);
  }

  @Get()
  @ApiOperation({ summary: '获取企业列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取企业列表成功',
  })
  async findAll(@Query() query: EnterpriseQueryDto) {
    return this.enterpriseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取企业详情' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取企业详情成功',
    type: EnterpriseResponseDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Enterprise> {
    return this.enterpriseService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '根据用户ID获取企业' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取企业成功',
    type: EnterpriseResponseDto,
  })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<Enterprise | null> {
    return this.enterpriseService.findByUserId(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新企业信息' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '企业更新成功',
    type: EnterpriseResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEnterpriseDto: UpdateEnterpriseDto,
  ): Promise<Enterprise> {
    return this.enterpriseService.update(id, updateEnterpriseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除企业' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '企业删除成功',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.enterpriseService.remove(id);
  }

  @Post(':id/track-policy')
  @ApiOperation({ summary: '关注政策' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '关注政策成功',
  })
  async trackPolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('policyId') policyId: string,
  ): Promise<Enterprise> {
    return this.enterpriseService.trackPolicy(id, policyId);
  }

  @Post(':id/untrack-policy')
  @ApiOperation({ summary: '取消关注政策' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '取消关注政策成功',
  })
  async untrackPolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('policyId') policyId: string,
  ): Promise<Enterprise> {
    return this.enterpriseService.untrackPolicy(id, policyId);
  }

  @Put(':id/notification-settings')
  @ApiOperation({ summary: '更新通知设置' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '通知设置更新成功',
  })
  async updateNotificationSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    settings: {
      email?: boolean;
      sms?: boolean;
      wechat?: boolean;
      advanceDays?: number;
    },
  ): Promise<Enterprise> {
    return this.enterpriseService.updateNotificationSettings(id, settings);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: '获取企业申报统计' })
  @ApiParam({ name: 'id', description: '企业ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取统计成功',
  })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.enterpriseService.getStatistics(id);
  }
}