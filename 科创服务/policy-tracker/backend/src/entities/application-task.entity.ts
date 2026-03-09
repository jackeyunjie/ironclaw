import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { Policy } from './policy.entity';

export enum TaskStatus {
  PENDING = '待开始',
  PREPARING = '准备中',
  IN_REVIEW = '审核中',
  SUBMITTED = '已提交',
  APPROVED = '已通过',
  REJECTED = '未通过',
  EXPIRED = '已过期',
}

@Entity('application_tasks')
export class ApplicationTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  enterpriseId: string;

  @Index()
  @Column({ type: 'uuid' })
  policyId: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'json', nullable: true })
  materials: {
    materialId: string;
    name: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    fileUrl?: string;
    uploadedAt?: Date;
    remark?: string;
  }[];

  @Column({ type: 'date', nullable: true })
  startedAt: Date;

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  completedAt: Date;

  @Column({ type: 'json', nullable: true })
  reminders: {
    type: string;
    scheduledAt: Date;
    sent: boolean;
  }[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  resultComment: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedAmount: number;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.applicationTasks)
  @JoinColumn({ name: 'enterpriseId' })
  enterprise: Enterprise;

  @ManyToOne(() => Policy)
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}