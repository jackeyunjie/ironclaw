import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Enterprise } from '../../entities/enterprise.entity';
import {
  CreateEnterpriseDto,
  UpdateEnterpriseDto,
  EnterpriseQueryDto,
} from '../../dto/enterprise.dto';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(Enterprise)
    private enterpriseRepository: Repository<Enterprise>,
  ) {}

  async create(createEnterpriseDto: CreateEnterpriseDto): Promise<Enterprise> {
    // 检查统一社会信用代码是否已存在
    const existing = await this.enterpriseRepository.findOne({
      where: { creditCode: createEnterpriseDto.creditCode },
    });

    if (existing) {
      throw new ConflictException('该统一社会信用代码已被注册');
    }

    const enterprise = this.enterpriseRepository.create({
      ...createEnterpriseDto,
      notificationSettings: {
        email: true,
        sms: true,
        wechat: true,
        advanceDays: 7,
      },
    });

    return this.enterpriseRepository.save(enterprise);
  }

  async findAll(query: EnterpriseQueryDto): Promise<{
    items: Enterprise[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { keyword, scale, industry, page = 1, limit = 10 } = query;

    const where: any = {};

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (scale) {
      where.scale = scale;
    }

    if (industry) {
      where.industry = industry;
    }

    const [items, total] = await this.enterpriseRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id },
      relations: ['applicationTasks'],
    });

    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }

    return enterprise;
  }

  async findByUserId(userId: string): Promise<Enterprise | null> {
    return this.enterpriseRepository.findOne({
      where: { userId },
    });
  }

  async update(
    id: string,
    updateEnterpriseDto: UpdateEnterpriseDto,
  ): Promise<Enterprise> {
    const enterprise = await this.findOne(id);

    // 如果修改了统一社会信用代码，检查是否重复
    if (
      updateEnterpriseDto.creditCode &&
      updateEnterpriseDto.creditCode !== enterprise.creditCode
    ) {
      const existing = await this.enterpriseRepository.findOne({
        where: { creditCode: updateEnterpriseDto.creditCode },
      });

      if (existing) {
        throw new ConflictException('该统一社会信用代码已被注册');
      }
    }

    Object.assign(enterprise, updateEnterpriseDto);
    return this.enterpriseRepository.save(enterprise);
  }

  async remove(id: string): Promise<void> {
    const enterprise = await this.findOne(id);
    await this.enterpriseRepository.remove(enterprise);
  }

  async trackPolicy(enterpriseId: string, policyId: string): Promise<Enterprise> {
    const enterprise = await this.findOne(enterpriseId);

    if (!enterprise.trackedPolicyIds) {
      enterprise.trackedPolicyIds = [];
    }

    if (!enterprise.trackedPolicyIds.includes(policyId)) {
      enterprise.trackedPolicyIds.push(policyId);
      await this.enterpriseRepository.save(enterprise);
    }

    return enterprise;
  }

  async untrackPolicy(
    enterpriseId: string,
    policyId: string,
  ): Promise<Enterprise> {
    const enterprise = await this.findOne(enterpriseId);

    if (enterprise.trackedPolicyIds) {
      enterprise.trackedPolicyIds = enterprise.trackedPolicyIds.filter(
        (id) => id !== policyId,
      );
      await this.enterpriseRepository.save(enterprise);
    }

    return enterprise;
  }

  async updateNotificationSettings(
    id: string,
    settings: {
      email?: boolean;
      sms?: boolean;
      wechat?: boolean;
      advanceDays?: number;
    },
  ): Promise<Enterprise> {
    const enterprise = await this.findOne(id);

    enterprise.notificationSettings = {
      ...enterprise.notificationSettings,
      ...settings,
    };

    return this.enterpriseRepository.save(enterprise);
  }

  async getStatistics(id: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    totalApprovedAmount: number;
  }> {
    const enterprise = await this.findOne(id);

    const tasks = enterprise.applicationTasks || [];
    const approvedTasks = tasks.filter((t) => t.status === '已通过');

    return {
      totalApplications: tasks.length,
      pendingApplications: tasks.filter((t) =>
        ['待开始', '准备中', '审核中'].includes(t.status),
      ).length,
      approvedApplications: approvedTasks.length,
      totalApprovedAmount: approvedTasks.reduce(
        (sum, t) => sum + (t.approvedAmount || 0),
        0,
      ),
    };
  }
}