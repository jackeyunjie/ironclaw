import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalRecord,
  ApprovalStatus,
  ApprovalLevel,
} from '../../entities/approval-record.entity';
import { ApplicationTask, TaskStatus } from '../../entities/application-task.entity';
import { User, UserRole } from '../../entities/user.entity';

export interface ApprovalConfig {
  levels: ApprovalLevel[];
  approvers: {
    [key in ApprovalLevel]?: string[];
  };
}

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(ApprovalRecord)
    private approvalRepository: Repository<ApprovalRecord>,
    @InjectRepository(ApplicationTask)
    private applicationRepository: Repository<ApplicationTask>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建审批流程
   */
  async createApprovalWorkflow(
    applicationId: string,
    config: ApprovalConfig,
  ): Promise<ApprovalRecord[]> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['enterprise', 'policy'],
    });

    if (!application) {
      throw new NotFoundException('申报任务不存在');
    }

    // 检查是否已存在审批流程
    const existingApprovals = await this.approvalRepository.find({
      where: { applicationId },
    });

    if (existingApprovals.length > 0) {
      throw new BadRequestException('该申报任务已存在审批流程');
    }

    const approvals: ApprovalRecord[] = [];
    let sequence = 0;

    for (const level of config.levels) {
      const approverIds = config.approvers[level] || [];

      for (const approverId of approverIds) {
        const approver = await this.userRepository.findOne({
          where: { id: approverId },
        });

        if (!approver) {
          throw new NotFoundException(`审批人不存在: ${approverId}`);
        }

        const approval = this.approvalRepository.create({
          applicationId,
          approverId,
          approverName: approver.username,
          level,
          status: sequence === 0 ? ApprovalStatus.PENDING : ApprovalStatus.PENDING,
          sequence,
        });

        approvals.push(approval);
        sequence++;
      }
    }

    const saved = await this.approvalRepository.save(approvals);

    // 更新申报状态为审核中
    application.status = TaskStatus.IN_REVIEW;
    await this.applicationRepository.save(application);

    return saved;
  }

  /**
   * 获取审批流程
   */
  async getApprovalWorkflow(applicationId: string): Promise<{
    records: ApprovalRecord[];
    currentStep: number;
    totalSteps: number;
    status: string;
  }> {
    const records = await this.approvalRepository.find({
      where: { applicationId },
      order: { sequence: 'ASC' },
    });

    if (records.length === 0) {
      throw new NotFoundException('审批流程不存在');
    }

    const currentStep = records.findIndex(
      (r) => r.status === ApprovalStatus.PENDING,
    );

    const completedRecords = records.filter(
      (r) => r.status === ApprovalStatus.APPROVED,
    );

    const rejectedRecord = records.find(
      (r) => r.status === ApprovalStatus.REJECTED,
    );

    let status = 'in_progress';
    if (rejectedRecord) {
      status = 'rejected';
    } else if (completedRecords.length === records.length) {
      status = 'completed';
    }

    return {
      records,
      currentStep: currentStep === -1 ? records.length : currentStep,
      totalSteps: records.length,
      status,
    };
  }

  /**
   * 提交审批
   */
  async submitApproval(
    approvalId: string,
    approverId: string,
    data: {
      status: ApprovalStatus;
      comment?: string;
      attachments?: any[];
    },
  ): Promise<ApprovalRecord> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new NotFoundException('审批记录不存在');
    }

    if (approval.approverId !== approverId) {
      throw new BadRequestException('无权审批此申请');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('该审批已完成');
    }

    // 检查是否为当前步骤
    const workflow = await this.getApprovalWorkflow(approval.applicationId);
    if (workflow.currentStep !== approval.sequence) {
      throw new BadRequestException('请等待前置审批完成');
    }

    approval.status = data.status;
    approval.comment = data.comment;
    approval.attachments = data.attachments;
    approval.approvedAt = new Date();

    const saved = await this.approvalRepository.save(approval);

    // 更新申报任务状态
    await this.updateApplicationStatus(approval.applicationId);

    return saved;
  }

  /**
   * 更新申报任务状态
   */
  private async updateApplicationStatus(applicationId: string): Promise<void> {
    const workflow = await this.getApprovalWorkflow(applicationId);
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) return;

    if (workflow.status === 'completed') {
      application.status = TaskStatus.SUBMITTED;
      application.submittedAt = new Date();
    } else if (workflow.status === 'rejected') {
      application.status = TaskStatus.REJECTED;
    }

    await this.applicationRepository.save(application);
  }

  /**
   * 获取待审批列表
   */
  async getPendingApprovals(
    approverId: string,
  ): Promise<(ApprovalRecord & { application: ApplicationTask })[]> {
    const records = await this.approvalRepository.find({
      where: { approverId, status: ApprovalStatus.PENDING },
    });

    const result = [];
    for (const record of records) {
      const application = await this.applicationRepository.findOne({
        where: { id: record.applicationId },
        relations: ['enterprise', 'policy'],
      });

      if (application) {
        // 检查是否为当前步骤
        const workflow = await this.getApprovalWorkflow(record.applicationId);
        if (workflow.currentStep === record.sequence) {
          result.push({ ...record, application });
        }
      }
    }

    return result;
  }

  /**
   * 获取审批历史
   */
  async getApprovalHistory(
    approverId: string,
    query: { status?: ApprovalStatus; page?: number; limit?: number } = {},
  ): Promise<{ items: ApprovalRecord[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;

    const where: any = { approverId };
    if (status) {
      where.status = status;
    } else {
      where.status = () => `status != '${ApprovalStatus.PENDING}'`;
    }

    const [items, total] = await this.approvalRepository.findAndCount({
      where,
      order: { approvedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取企业的申报审批历史
   */
  async getEnterpriseApprovals(
    enterpriseId: string,
  ): Promise<{ applicationId: string; workflow: any }[]> {
    const applications = await this.applicationRepository.find({
      where: { enterpriseId },
    });

    const result = [];
    for (const app of applications) {
      try {
        const workflow = await this.getApprovalWorkflow(app.id);
        result.push({
          applicationId: app.id,
          policyId: app.policyId,
          policyName: app.policy?.name || '',
          workflow,
        });
      } catch (e) {
        // 没有审批流程的跳过
      }
    }

    return result;
  }

  /**
   * 撤回审批
   */
  async withdrawApproval(
    applicationId: string,
    userId: string,
  ): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('申报任务不存在');
    }

    if (application.enterpriseId !== userId) {
      throw new BadRequestException('无权撤回此申请');
    }

    const workflow = await this.getApprovalWorkflow(applicationId);
    if (workflow.status === 'completed') {
      throw new BadRequestException('审批已完成，无法撤回');
    }

    // 删除审批记录
    await this.approvalRepository.delete({ applicationId });

    // 恢复申报状态
    application.status = TaskStatus.PREPARING;
    await this.applicationRepository.save(application);
  }
}
