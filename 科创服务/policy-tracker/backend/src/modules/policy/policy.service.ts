import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, Like } from 'typeorm';
import {
  Policy,
  PolicyStatus,
  PolicyCategory,
  PolicyLevel,
} from '../../entities/policy.entity';
import { Enterprise } from '../../entities/enterprise.entity';
import {
  CreatePolicyDto,
  UpdatePolicyDto,
  PolicyQueryDto,
  PolicyResponseDto,
} from '../../dto/policy.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(Enterprise)
    private enterpriseRepository: Repository<Enterprise>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const policy = this.policyRepository.create(createPolicyDto);
    policy.status = this.calculatePolicyStatus(policy);
    return this.policyRepository.save(policy);
  }

  async findAll(query: PolicyQueryDto): Promise<{
    items: Policy[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { keyword, category, level, status, region, page = 1, limit = 10 } = query;

    const where: any = { isActive: true };

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    }

    if (region) {
      where.region = region;
    }

    const [items, total] = await this.policyRepository.findAndCount({
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

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id, isActive: true },
    });

    if (!policy) {
      throw new NotFoundException('政策不存在');
    }

    // 增加浏览次数
    policy.viewCount += 1;
    await this.policyRepository.save(policy);

    return policy;
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id);
    Object.assign(policy, updatePolicyDto);
    policy.status = this.calculatePolicyStatus(policy);
    return this.policyRepository.save(policy);
  }

  async remove(id: string): Promise<void> {
    const policy = await this.findOne(id);
    policy.isActive = false;
    await this.policyRepository.save(policy);
  }

  async matchPoliciesForEnterprise(
    enterpriseId: string,
    limit: number = 10,
  ): Promise<Policy[]> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { id: enterpriseId },
    });

    if (!enterprise) {
      throw new NotFoundException('企业不存在');
    }

    // 获取所有有效政策
    const policies = await this.policyRepository.find({
      where: {
        isActive: true,
        status: Between(PolicyStatus.UPCOMING, PolicyStatus.CLOSING),
      },
    });

    // 计算匹配度并排序
    const matchedPolicies = policies
      .map((policy) => ({
        ...policy,
        matchScore: this.calculateMatchScore(enterprise, policy),
      }))
      .filter((p) => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return matchedPolicies;
  }

  async getUpcomingPolicies(days: number = 7): Promise<Policy[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return this.policyRepository.find({
      where: {
        isActive: true,
        applyStartDate: Between(now, future),
      },
      order: { applyStartDate: 'ASC' },
    });
  }

  async getClosingPolicies(days: number = 7): Promise<Policy[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    return this.policyRepository.find({
      where: {
        isActive: true,
        applyEndDate: Between(now, future),
      },
      order: { applyEndDate: 'ASC' },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updatePolicyStatus(): Promise<void> {
    const policies = await this.policyRepository.find({
      where: { isActive: true },
    });

    for (const policy of policies) {
      const newStatus = this.calculatePolicyStatus(policy);
      if (newStatus !== policy.status) {
        policy.status = newStatus;
        await this.policyRepository.save(policy);
      }
    }
  }

  private calculatePolicyStatus(policy: Policy): PolicyStatus {
    const now = new Date();
    const startDate = policy.applyStartDate;
    const endDate = policy.applyEndDate;

    if (!startDate || !endDate) {
      return PolicyStatus.UPCOMING;
    }

    // 即将开始（7天内）
    const daysBeforeStart = Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysBeforeStart > 0 && daysBeforeStart <= 7) {
      return PolicyStatus.UPCOMING;
    }

    // 即将截止（7天内）
    const daysBeforeEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysBeforeEnd > 0 && daysBeforeEnd <= 7) {
      return PolicyStatus.CLOSING;
    }

    // 申报中
    if (now >= startDate && now <= endDate) {
      return PolicyStatus.OPEN;
    }

    // 已截止
    if (now > endDate) {
      return PolicyStatus.CLOSED;
    }

    // 已过期
    if (policy.validUntil && now > policy.validUntil) {
      return PolicyStatus.EXPIRED;
    }

    return PolicyStatus.UPCOMING;
  }

  private calculateMatchScore(enterprise: Enterprise, policy: Policy): number {
    let score = 0;
    const weights = {
      industry: 30,
      scale: 20,
      region: 20,
      qualifications: 15,
      revenue: 15,
    };

    // 行业匹配
    if (
      policy.industries &&
      policy.industries.includes(enterprise.industry)
    ) {
      score += weights.industry;
    } else if (!policy.industries || policy.industries.length === 0) {
      score += weights.industry * 0.5;
    }

    // 地区匹配
    if (policy.region && enterprise.city) {
      if (enterprise.city.includes(policy.region) || policy.region.includes(enterprise.city)) {
        score += weights.region;
      }
    } else {
      score += weights.region * 0.5;
    }

    // 企业规模匹配（根据政策条件推断）
    if (policy.eligibility) {
      const eligibilityText = policy.eligibility.join(' ');
      if (
        (enterprise.scale === '小型企业' && eligibilityText.includes('小型')) ||
        (enterprise.scale === '中型企业' && eligibilityText.includes('中型')) ||
        (enterprise.scale === '微型企业' && eligibilityText.includes('微型'))
      ) {
        score += weights.scale;
      }
    }

    // 资质匹配
    if (enterprise.qualifications && enterprise.qualifications.length > 0) {
      score += weights.qualifications;
    }

    // 营收匹配
    if (enterprise.annualRevenue && enterprise.annualRevenue > 0) {
      score += weights.revenue;
    }

    return score;
  }
}