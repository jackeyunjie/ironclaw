import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PolicyCategory {
  HIGH_TECH = '国家高新技术企业',
  SPECIALIZED = '专精特新',
  RESEARCH = '研发补贴',
  TALENT = '人才政策',
  FINANCE = '融资支持',
  TAX = '税收优惠',
  INTELLECTUAL = '知识产权',
  OTHERS = '其他',
}

export enum PolicyLevel {
  NATIONAL = '国家级',
  PROVINCIAL = '省级',
  MUNICIPAL = '市级',
  DISTRICT = '区级',
}

export enum PolicyStatus {
  UPCOMING = '即将开始',
  OPEN = '申报中',
  CLOSING = '即将截止',
  CLOSED = '已截止',
  EXPIRED = '已过期',
}

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PolicyCategory,
    default: PolicyCategory.OTHERS,
  })
  category: PolicyCategory;

  @Index()
  @Column({
    type: 'enum',
    enum: PolicyLevel,
    default: PolicyLevel.MUNICIPAL,
  })
  level: PolicyLevel;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  eligibility: string[];

  @Column({ type: 'json', nullable: true })
  benefits: {
    type: string;
    amount: string;
    description: string;
  }[];

  @Column({ type: 'json', nullable: true })
  materials: {
    name: string;
    required: boolean;
    description: string;
    template?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  process: {
    step: number;
    title: string;
    description: string;
  }[];

  @Column({ type: 'date', nullable: true })
  publishDate: Date;

  @Index()
  @Column({ type: 'date', nullable: true })
  applyStartDate: Date;

  @Index()
  @Column({ type: 'date', nullable: true })
  applyEndDate: Date;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  officialUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.UPCOMING,
  })
  status: PolicyStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region: string;

  @Column({ type: 'simple-array', nullable: true })
  industries: string[];

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  applyCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}