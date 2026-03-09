import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
}

export enum ApprovalLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  FINAL = 'final',
}

@Entity('approval_records')
export class ApprovalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  applicationId: string;

  @Index()
  @Column({ type: 'uuid' })
  approverId: string;

  @Column({ type: 'varchar', length: 100 })
  approverName: string;

  @Column({
    type: 'enum',
    enum: ApprovalLevel,
  })
  level: ApprovalLevel;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'json', nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
