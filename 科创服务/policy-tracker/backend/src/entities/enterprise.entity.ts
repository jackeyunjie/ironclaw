import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApplicationTask } from './application-task.entity';

export enum EnterpriseScale {
  MICRO = '微型企业',
  SMALL = '小型企业',
  MEDIUM = '中型企业',
  LARGE = '大型企业',
}

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  creditCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({
    type: 'enum',
    enum: EnterpriseScale,
    default: EnterpriseScale.SMALL,
  })
  scale: EnterpriseScale;

  @Column({ type: 'date', nullable: true })
  registerDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  registerCapital: number;

  @Column({ type: 'int', nullable: true })
  employees: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  district: string;

  @Column({ type: 'simple-array', nullable: true })
  qualifications: string[];

  @Column({ type: 'json', nullable: true })
  intellectualProperty: {
    patents: number;
    softwareCopyrights: number;
    trademarks: number;
  };

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  rdExpense: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rdRatio: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactEmail: string;

  @Column({ type: 'simple-array', nullable: true })
  trackedPolicyIds: string[];

  @Column({ type: 'json', nullable: true })
  notificationSettings: {
    email: boolean;
    sms: boolean;
    wechat: boolean;
    advanceDays: number;
  };

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @OneToMany(() => ApplicationTask, (task) => task.enterprise)
  applicationTasks: ApplicationTask[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}