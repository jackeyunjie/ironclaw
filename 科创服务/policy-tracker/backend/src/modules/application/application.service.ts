import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ApplicationTask, TaskStatus } from '../../entities/application-task.entity';
import { Policy } from '../../entities/policy.entity';
import { Enterprise } from '../../entities/enterprise.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationTask)
    private readonly applicationRepository: Repository<ApplicationTask>,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(Enterprise)
    private readonly enterpriseRepository: Repository<Enterprise>,
  ) {}

  /**
   * 创建申报任务
   */
  async create(data: Partial<ApplicationTask>): Promise<ApplicationTask> {
    // 检查企业和政策是否存在
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id: data.enterpriseId },
    });
    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }

    const policy = await this.policyRepository.findOne({
      where: { id: data.policyId },
    });
    if (!policy) {
      throw new NotFoundException('政策不存在');
    }

    // 检查是否已存在申报任务
    const existing = await this.applicationRepository.findOne({
      where: {
        enterpriseId: data.enterpriseId,
        policyId: data.policyId,
      },
    });
    if (existing) {
      throw new BadRequestException('该政策的申报任务已存在');
    }

    const application = this.applicationRepository.create({
      ...data,
      status: TaskStatus.PENDING,
      progress: 0,
    } as ApplicationTask);

    return this.applicationRepository.save(application);
  }

  /**
   * 获取申报任务列表
   */
  async findAll(query: {
    enterpriseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ApplicationTask[]; total: number }> {
    const { enterpriseId, status, page = 1, limit = 10 } = query;

    const where: any = {};
    if (enterpriseId) {
      where.enterpriseId = enterpriseId;
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await this.applicationRepository.findAndCount({
      where,
      relations: ['policy', 'enterprise'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取申报任务详情
   */
  async findOne(id: string): Promise<ApplicationTask> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['policy', 'enterprise'],
    });

    if (!application) {
      throw new NotFoundException('申报任务不存在');
    }

    return application;
  }

  /**
   * 更新申报任务
   */
  async update(id: string, data: Partial<ApplicationTask>): Promise<ApplicationTask> {
    const application = await this.findOne(id);

    // 更新进度
    if (data.materials) {
      const materials = data.materials as any[];
      const completedCount = materials.filter(m => m.status === '已完成').length;
      data.progress = Math.round((completedCount / materials.length) * 100);
    }

    Object.assign(application, data);
    return this.applicationRepository.save(application);
  }

  /**
   * 删除申报任务
   */
  async remove(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }

  /**
   * 更新材料状态
   */
  async updateMaterialStatus(
    id: string,
    materialName: string,
    status: string,
    fileUrl?: string,
  ): Promise<ApplicationTask> {
    const application = await this.findOne(id);
    const materials = (application.materials as any[]) || [];

    const material = materials.find(m => m.name === materialName);
    if (!material) {
      throw new NotFoundException('材料不存在');
    }

    material.status = status;
    if (fileUrl) {
      material.fileUrl = fileUrl;
    }

    // 重新计算进度
    const completedCount = materials.filter(m => m.status === '已完成').length;
    application.progress = Math.round((completedCount / materials.length) * 100);

    return this.applicationRepository.save(application);
  }

  /**
   * 获取即将截止的申报任务
   */
  async getUpcomingDeadlines(
    enterpriseId: string,
    days: number = 7,
  ): Promise<ApplicationTask[]> {
    const now = new Date();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    return this.applicationRepository.find({
      where: {
        enterpriseId,
        status: Between(TaskStatus.PENDING, TaskStatus.SUBMITTED) as any,
      },
      relations: ['policy'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取申报统计
   */
  async getStatistics(enterpriseId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    completionRate: number;
  }> {
    const applications = await this.applicationRepository.find({
      where: { enterpriseId },
    });

    const byStatus: Record<string, number> = {};
    applications.forEach(app => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });

    const completed = applications.filter(
      app => app.status === TaskStatus.APPROVED,
    ).length;

    return {
      total: applications.length,
      byStatus,
      completionRate:
        applications.length > 0
          ? Math.round((completed / applications.length) * 100)
          : 0,
    };
  }

  /**
   * 批量创建申报任务
   */
  async batchCreate(
    enterpriseId: string,
    policyIds: string[],
  ): Promise<ApplicationTask[]> {
    const applications: ApplicationTask[] = [];

    for (const policyId of policyIds) {
      try {
        const policy = await this.policyRepository.findOne({
          where: { id: policyId },
        });
        if (!policy) continue;

        const existing = await this.applicationRepository.findOne({
          where: { enterpriseId, policyId },
        });
        if (existing) continue;

        const application = this.applicationRepository.create({
          enterpriseId,
          policyId,
          status: TaskStatus.PENDING,
          progress: 0,
          materials: [],
        } as ApplicationTask);

        const savedApp = await this.applicationRepository.save(application);
        applications.push(savedApp);
      } catch (error) {
        console.error(`创建申报任务失败: ${policyId}`, error);
      }
    }

    return applications;
  }
}