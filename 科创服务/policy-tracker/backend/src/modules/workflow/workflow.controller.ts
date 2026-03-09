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
import { WorkflowService, ApprovalConfig } from './workflow.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApprovalStatus } from '../../entities/approval-record.entity';

@ApiTags('审批工作流')
@Controller('workflow')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post(':applicationId')
  @ApiOperation({ summary: '创建审批流程' })
  @ApiParam({ name: 'applicationId', description: '申报任务ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  async createWorkflow(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() config: ApprovalConfig,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    // 只允许企业用户或管理员创建审批流程
    if (role !== 'enterprise' && role !== 'admin') {
      return { error: '无权创建审批流程' };
    }
    return this.workflowService.createApprovalWorkflow(applicationId, config);
  }

  @Get(':applicationId')
  @ApiOperation({ summary: '获取审批流程' })
  @ApiParam({ name: 'applicationId', description: '申报任务ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getWorkflow(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    return this.workflowService.getApprovalWorkflow(applicationId);
  }

  @Put(':approvalId/approve')
  @ApiOperation({ summary: '审批通过' })
  @ApiParam({ name: 'approvalId', description: '审批记录ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '审批成功' })
  async approve(
    @Param('approvalId', ParseUUIDPipe) approvalId: string,
    @CurrentUser('id') userId: string,
    @Body() data: { comment?: string; attachments?: any[] },
  ) {
    return this.workflowService.submitApproval(approvalId, userId, {
      status: ApprovalStatus.APPROVED,
      ...data,
    });
  }

  @Put(':approvalId/reject')
  @ApiOperation({ summary: '审批驳回' })
  @ApiParam({ name: 'approvalId', description: '审批记录ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '驳回成功' })
  async reject(
    @Param('approvalId', ParseUUIDPipe) approvalId: string,
    @CurrentUser('id') userId: string,
    @Body() data: { comment?: string; attachments?: any[] },
  ) {
    return this.workflowService.submitApproval(approvalId, userId, {
      status: ApprovalStatus.REJECTED,
      ...data,
    });
  }

  @Put(':approvalId/return')
  @ApiOperation({ summary: '退回修改' })
  @ApiParam({ name: 'approvalId', description: '审批记录ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '退回成功' })
  async returnForEdit(
    @Param('approvalId', ParseUUIDPipe) approvalId: string,
    @CurrentUser('id') userId: string,
    @Body() data: { comment?: string; attachments?: any[] },
  ) {
    return this.workflowService.submitApproval(approvalId, userId, {
      status: ApprovalStatus.RETURNED,
      ...data,
    });
  }

  @Get('pending/my')
  @ApiOperation({ summary: '获取我的待审批列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getMyPendingApprovals(
    @CurrentUser('id') userId: string,
  ) {
    return this.workflowService.getPendingApprovals(userId);
  }

  @Get('history/my')
  @ApiOperation({ summary: '获取我的审批历史' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getMyApprovalHistory(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ApprovalStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workflowService.getApprovalHistory(userId, {
      status,
      page: page ? parseInt(page as unknown as string, 10) : 1,
      limit: limit ? parseInt(limit as unknown as string, 10) : 10,
    });
  }

  @Get('enterprise/:enterpriseId')
  @ApiOperation({ summary: '获取企业申报审批历史' })
  @ApiParam({ name: 'enterpriseId', description: '企业ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getEnterpriseApprovals(
    @Param('enterpriseId', ParseUUIDPipe) enterpriseId: string,
  ) {
    return this.workflowService.getEnterpriseApprovals(enterpriseId);
  }

  @Delete(':applicationId')
  @ApiOperation({ summary: '撤回审批流程' })
  @ApiParam({ name: 'applicationId', description: '申报任务ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '撤回成功' })
  async withdrawWorkflow(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.workflowService.withdrawApproval(applicationId, userId);
  }
}
