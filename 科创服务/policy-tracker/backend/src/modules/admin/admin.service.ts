import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { Enterprise } from '../../entities/enterprise.entity';
import { Policy, PolicyStatus } from '../../entities/policy.entity';
import { ApplicationTask, TaskStatus } from '../../entities/application-task.entity';
import { Notification } from '../../entities/notification.entity';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  enterprises: {
    total: number;
    byScale: Record<string, number>;
    byIndustry: Record<string, number>;
  };
  policies: {
    total: number;
    active: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    approvedAmount: number;
    thisMonth: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

export interface TrendData {
  dates: string[];
  newUsers: number[];
  newEnterprises: number[];
  newApplications: number[];
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enterprise)
    private enterpriseRepository: Repository<Enterprise>,
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(ApplicationTask)
    private applicationRepository: Repository<ApplicationTask>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 获取仪表盘统计数据
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 用户统计
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const newUsersThisMonth = await this.userRepository.count({
      where: { createdAt: Between(firstDayOfMonth, now) },
    });

    // 企业统计
    const totalEnterprises = await this.enterpriseRepository.count();
    const enterprises = await this.enterpriseRepository.find();
    const byScale: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    enterprises.forEach((e) => {
      byScale[e.scale] = (byScale[e.scale] || 0) + 1;
      if (e.industry) {
        byIndustry[e.industry] = (byIndustry[e.industry] || 0) + 1;
      }
    });

    // 政策统计
    const totalPolicies = await this.policyRepository.count();
    const activePolicies = await this.policyRepository.count({
      where: { isActive: true },
    });
    const policies = await this.policyRepository.find();
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    policies.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });

    // 申报统计
    const totalApplications = await this.applicationRepository.count();
    const applications = await this.applicationRepository.find();
    const appByStatus: Record<string, number> = {};
    let approvedAmount = 0;
    let thisMonthCount = 0;
    applications.forEach((a) => {
      appByStatus[a.status] = (appByStatus[a.status] || 0) + 1;
      if (a.approvedAmount) {
        approvedAmount += Number(a.approvedAmount);
      }
      if (a.createdAt >= firstDayOfMonth) {
        thisMonthCount++;
      }
    });

    // 通知统计
    const totalNotifications = await this.notificationRepository.count();
    const unreadNotifications = await this.notificationRepository.count({
      where: { isRead: false },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
      },
      enterprises: {
        total: totalEnterprises,
        byScale,
        byIndustry,
      },
      policies: {
        total: totalPolicies,
        active: activePolicies,
        byCategory,
        byStatus,
      },
      applications: {
        total: totalApplications,
        byStatus: appByStatus,
        approvedAmount,
        thisMonth: thisMonthCount,
      },
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
      },
    };
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(days: number = 30): Promise<TrendData> {
    const dates: string[] = [];
    const newUsers: number[] = [];
    const newEnterprises: number[] = [];
    const newApplications: number[] = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [userCount, enterpriseCount, appCount] = await Promise.all([
        this.userRepository.count({
          where: { createdAt: Between(startOfDay, endOfDay) },
        }),
        this.enterpriseRepository.count({
          where: { createdAt: Between(startOfDay, endOfDay) },
        }),
        this.applicationRepository.count({
          where: { createdAt: Between(startOfDay, endOfDay) },
        }),
      ]);

      newUsers.push(userCount);
      newEnterprises.push(enterpriseCount);
      newApplications.push(appCount);
    }

    return { dates, newUsers, newEnterprises, newApplications };
  }

  /**
   * 获取用户列表（管理员用）
   */
  async getUserList(query: {
    keyword?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }): Promise<{ items: User[]; total: number }> {
    const { keyword, role, status, page = 1, limit = 10 } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      qb.andWhere(
        '(user.username LIKE :keyword OR user.email LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    const [items, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  /**
   * 获取企业列表（管理员用）
   */
  async getEnterpriseList(query: {
    keyword?: string;
    scale?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Enterprise[]; total: number }> {
    const { keyword, scale, industry, page = 1, limit = 10 } = query;

    const qb = this.enterpriseRepository.createQueryBuilder('enterprise');

    if (keyword) {
      qb.andWhere(
        '(enterprise.name LIKE :keyword OR enterprise.creditCode LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (scale) {
      qb.andWhere('enterprise.scale = :scale', { scale });
    }

    if (industry) {
      qb.andWhere('enterprise.industry = :industry', { industry });
    }

    const [items, total] = await qb
      .leftJoinAndSelect('enterprise.applicationTasks', 'tasks')
      .orderBy('enterprise.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 获取申报统计详情
   */
  async getApplicationStats(): Promise<{
    byMonth: { month: string; count: number; approved: number }[];
    byPolicy: { policyId: string; policyName: string; count: number }[];
    successRate: number;
  }> {
    const applications = await this.applicationRepository.find({
      relations: ['policy'],
    });

    // 按月统计
    const byMonthMap: Map<
      string,
      { count: number; approved: number }
    > = new Map();
    applications.forEach((app) => {
      const month = app.createdAt.toISOString().slice(0, 7);
      const current = byMonthMap.get(month) || { count: 0, approved: 0 };
      current.count++;
      if (app.status === TaskStatus.APPROVED) {
        current.approved++;
      }
      byMonthMap.set(month, current);
    });

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // 按政策统计
    const byPolicyMap: Map<string, { policyName: string; count: number }> =
      new Map();
    applications.forEach((app) => {
      if (app.policy) {
        const current = byPolicyMap.get(app.policyId) || {
          policyName: app.policy.name,
          count: 0,
        };
        current.count++;
        byPolicyMap.set(app.policyId, current);
      }
    });

    const byPolicy = Array.from(byPolicyMap.entries())
      .map(([policyId, data]) => ({ policyId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 成功率
    const approved = applications.filter(
      (a) => a.status === TaskStatus.APPROVED,
    ).length;
    const successRate =
      applications.length > 0
        ? Math.round((approved / applications.length) * 100)
        : 0;

    return { byMonth, byPolicy, successRate };
  }

  /**
   * 系统健康检查
   */
  async getSystemHealth(): Promise<{
    database: 'ok' | 'error';
    scraper: { lastRun?: Date; status: 'running' | 'idle' | 'error' };
    notifications: { pending: number };
  }> {
    // 数据库检查
    let database: 'ok' | 'error' = 'ok';
    try {
      await this.userRepository.query('SELECT 1');
    } catch {
      database = 'error';
    }

    // 通知队列检查
    const pendingNotifications = await this.notificationRepository.count({
      where: { isRead: false },
    });

    return {
      database,
      scraper: { status: 'idle' },
      notifications: { pending: pendingNotifications },
    };
  }
}
