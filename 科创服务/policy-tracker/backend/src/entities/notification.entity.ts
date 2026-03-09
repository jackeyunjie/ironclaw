import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  POLICY_CLOSING = 'policy_closing',       // 政策即将截止
  POLICY_OPENING = 'policy_opening',       // 政策开始申报
  MATERIAL_REVIEW = 'material_review',     // 材料审核结果
  APPLICATION_RESULT = 'application_result', // 申报结果
  SYSTEM = 'system',                       // 系统公告
  REMINDER = 'reminder',                   // 提醒
}

export enum NotificationChannel {
  IN_APP = 'in_app',      // 应用内
  EMAIL = 'email',        // 邮件
  SMS = 'sms',            // 短信
  WECHAT = 'wechat',      // 微信
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  data: {
    policyId?: string;
    applicationId?: string;
    daysRemaining?: number;
    isApproved?: boolean;
    amount?: number;
    feedback?: string;
    [key: string]: any;
  };

  @Column({
    type: 'simple-array',
    default: 'in_app',
  })
  channels: NotificationChannel[];

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
