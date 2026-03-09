import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { Policy, PolicyCategory, PolicyLevel, PolicyStatus } from '../../entities/policy.entity';

interface ScrapedPolicy {
  name: string;
  code?: string;
  category: PolicyCategory;
  level: PolicyLevel;
  department: string;
  description: string;
  eligibility?: string[];
  benefits?: { type: string; amount: string; description: string }[];
  materials?: { name: string; required: boolean; description: string }[];
  applyStartDate?: Date;
  applyEndDate?: Date;
  validUntil?: Date;
  officialUrl?: string;
  region: string;
  industries?: string[];
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    private httpService: HttpService,
  ) {}

  /**
   * 定期抓取政策数据
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledScrape(): Promise<void> {
    this.logger.log('开始定时抓取政策数据...');

    try {
      // 抓取北京科技政策
      await this.scrapeBeijingSciTechPolicies();

      // 抓取中关村政策
      await this.scrapeZhongguancunPolicies();

      // 抓取国家高新技术企业政策
      await this.scrapeNationalHighTechPolicies();

      this.logger.log('政策数据抓取完成');
    } catch (error) {
      this.logger.error('政策数据抓取失败:', error);
    }
  }

  /**
   * 抓取北京科技政策
   * 来源：北京市科学技术委员会
   */
  async scrapeBeijingSciTechPolicies(): Promise<number> {
    this.logger.log('抓取北京科技政策...');

    const sources = [
      {
        url: 'https://kw.beijing.gov.cn/zwgk/zcwj/zcjd/',
        level: PolicyLevel.MUNICIPAL,
        department: '北京市科学技术委员会',
      },
    ];

    let totalSaved = 0;

    for (const source of sources) {
      try {
        const policies = await this.fetchFromBeijingGov(source.url, source);
        const saved = await this.savePolicies(policies);
        totalSaved += saved;
      } catch (error) {
        this.logger.error(`抓取失败 ${source.url}:`, error.message);
      }
    }

    return totalSaved;
  }

  /**
   * 抓取中关村政策
   */
  async scrapeZhongguancunPolicies(): Promise<number> {
    this.logger.log('抓取中关村政策...');

    // 模拟数据（实际实现需要解析具体网页结构）
    const mockPolicies: ScrapedPolicy[] = [
      {
        name: '中关村高新技术企业培育支持资金',
        code: 'ZC2026001',
        category: PolicyCategory.HIGH_TECH,
        level: PolicyLevel.MUNICIPAL,
        department: '中关村科技园区管理委员会',
        description: '支持中关村高新技术企业开展技术创新和成果转化',
        eligibility: ['注册在中关村示范区内的企业', '具有独立法人资格', '从事高新技术领域研发或生产'],
        benefits: [
          { type: '资金支持', amount: '最高50万元', description: '根据企业研发投入给予一定比例支持' },
        ],
        materials: [
          { name: '企业营业执照', required: true, description: '加盖公章的复印件' },
          { name: '研发项目说明', required: true, description: '项目技术路线、创新点说明' },
          { name: '财务报表', required: true, description: '上年度财务审计报告' },
        ],
        region: '中关村示范区',
        industries: ['信息技术', '生物医药', '新材料'],
      },
    ];

    return this.savePolicies(mockPolicies);
  }

  /**
   * 抓取国家高新技术企业政策
   */
  async scrapeNationalHighTechPolicies(): Promise<number> {
    this.logger.log('抓取国家高新技术企业政策...');

    const mockPolicies: ScrapedPolicy[] = [
      {
        name: '2026年国家高新技术企业认定',
        code: 'GX2026001',
        category: PolicyCategory.HIGH_TECH,
        level: PolicyLevel.NATIONAL,
        department: '科技部火炬中心',
        description: '组织开展2026年度国家高新技术企业认定工作',
        eligibility: [
          '在中国境内注册成立一年以上的居民企业',
          '拥有自主知识产权',
          '技术属于《国家重点支持的高新技术领域》',
          '科技人员占比不低于10%',
          '研发费用占比达标',
        ],
        benefits: [
          { type: '税收优惠', amount: '所得税减免至15%', description: '企业所得税税率从25%降至15%' },
          { type: '资质认定', amount: '', description: '获得国家级高新技术企业资质' },
        ],
        materials: [
          { name: '高新技术企业认定申请书', required: true, description: '在线填写后导出' },
          { name: '营业执照', required: true, description: '复印件加盖公章' },
          { name: '知识产权证书', required: true, description: '专利、软著等证书' },
          { name: '研发费用专项审计报告', required: true, description: '具有资质的中介机构出具' },
          { name: '高新技术产品收入专项审计报告', required: true, description: '' },
        ],
        region: '全国',
        industries: ['电子信息', '生物与新医药', '航空航天', '新材料', '高技术服务', '新能源与节能', '资源与环境', '先进制造与自动化'],
      },
    ];

    return this.savePolicies(mockPolicies);
  }

  /**
   * 从北京市政府网站抓取
   */
  private async fetchFromBeijingGov(url: string, source: any): Promise<ScrapedPolicy[]> {
    try {
      const response = await firstValueFrom(this.httpService.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      }));

      const $ = cheerio.load(response.data);
      const policies: ScrapedPolicy[] = [];

      // 根据实际网页结构调整选择器
      $('.list-item, .news-item, .policy-item').each((_, elem) => {
        const title = $(elem).find('.title, a').text().trim();
        const link = $(elem).find('a').attr('href');
        const dateText = $(elem).find('.date, .time').text().trim();

        if (title && this.isPolicyTitle(title)) {
          policies.push({
            name: title,
            category: this.classifyPolicy(title),
            level: source.level,
            department: source.department,
            description: title,
            officialUrl: link ? new URL(link, url).href : undefined,
            region: '北京市',
          });
        }
      });

      return policies;
    } catch (error) {
      this.logger.error(`抓取失败: ${url}`, error.message);
      return [];
    }
  }

  /**
   * 判断是否为政策标题
   */
  private isPolicyTitle(title: string): boolean {
    const keywords = ['政策', '通知', '公告', '办法', '规定', '意见', '补贴', '奖励', '申报', '认定'];
    return keywords.some(keyword => title.includes(keyword));
  }

  /**
   * 政策分类
   */
  private classifyPolicy(title: string): PolicyCategory {
    if (title.includes('高新技术')) return PolicyCategory.HIGH_TECH;
    if (title.includes('专精特新')) return PolicyCategory.SPECIALIZED;
    if (title.includes('研发') || title.includes('R&D')) return PolicyCategory.RESEARCH;
    if (title.includes('人才')) return PolicyCategory.TALENT;
    if (title.includes('融资') || title.includes('贷款')) return PolicyCategory.FINANCE;
    if (title.includes('税')) return PolicyCategory.TAX;
    if (title.includes('专利') || title.includes('知识产权')) return PolicyCategory.INTELLECTUAL;
    return PolicyCategory.OTHERS;
  }

  /**
   * 保存政策到数据库
   */
  private async savePolicies(policies: ScrapedPolicy[]): Promise<number> {
    let saved = 0;

    for (const policyData of policies) {
      try {
        // 检查是否已存在
        const existing = await this.policyRepository.findOne({
          where: { name: policyData.name },
        });

        if (existing) {
          // 更新现有政策
          Object.assign(existing, policyData);
          existing.status = this.calculatePolicyStatus(existing);
          await this.policyRepository.save(existing);
          this.logger.debug(`更新政策: ${policyData.name}`);
        } else {
          // 创建新政策
          const policy = this.policyRepository.create({
            ...policyData,
            status: PolicyStatus.UPCOMING,
            isActive: true,
            viewCount: 0,
            applyCount: 0,
          });
          policy.status = this.calculatePolicyStatus(policy);
          await this.policyRepository.save(policy);
          saved++;
          this.logger.debug(`新增政策: ${policyData.name}`);
        }
      } catch (error) {
        this.logger.error(`保存政策失败 ${policyData.name}:`, error.message);
      }
    }

    this.logger.log(`成功保存 ${saved} 条政策`);
    return saved;
  }

  /**
   * 计算政策状态
   */
  private calculatePolicyStatus(policy: Policy): PolicyStatus {
    const now = new Date();

    if (policy.applyEndDate && now > policy.applyEndDate) {
      return PolicyStatus.CLOSED;
    }

    if (policy.applyStartDate) {
      const daysToStart = Math.ceil(
        (policy.applyStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysToStart > 0 && daysToStart <= 7) {
        return PolicyStatus.UPCOMING;
      }
      if (daysToStart <= 0) {
        if (policy.applyEndDate) {
          const daysToEnd = Math.ceil(
            (policy.applyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysToEnd > 0 && daysToEnd <= 7) {
            return PolicyStatus.CLOSING;
          }
          if (daysToEnd > 7) {
            return PolicyStatus.OPEN;
          }
        }
        return PolicyStatus.OPEN;
      }
    }

    return PolicyStatus.UPCOMING;
  }

  /**
   * 手动触发抓取
   */
  async manualScrape(sources?: string[]): Promise<{ [key: string]: number }> {
    const results: { [key: string]: number } = {};

    if (!sources || sources.includes('beijing')) {
      results.beijing = await this.scrapeBeijingSciTechPolicies();
    }

    if (!sources || sources.includes('zhongguancun')) {
      results.zhongguancun = await this.scrapeZhongguancunPolicies();
    }

    if (!sources || sources.includes('national')) {
      results.national = await this.scrapeNationalHighTechPolicies();
    }

    return results;
  }
}
