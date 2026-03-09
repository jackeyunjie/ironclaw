import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Notification, NotificationType, NotificationChannel } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  /**
   * 批量创建通知
   */
  async createNotifications(dataList: Partial<Notification>[]): Promise<Notification[]> {
    const notifications = dataList.map(data => this.notificationRepository.create(data));
    return this.notificationRepository.save(notifications);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number } = {},
  ): Promise<{ items: Notification[]; total: number; unreadCount: number }> {
    const { unreadOnly = false, limit = 20, offset = 0 } = options;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [items, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { items, total, unreadCount };
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  /**
   * 发送政策截止提醒
   */
  async sendPolicyClosingReminder(
    userId: string,
    policyId: string,
    policyName: string,
    daysRemaining: number,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.POLICY_CLOSING,
      title: '申报即将截止提醒',
      content: `您关注的政策「${policyName}」申报窗口将在${daysRemaining}天后关闭，请尽快完成申报。`,
      data: { policyId, daysRemaining },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * 发送政策开始提醒
   */
  async sendPolicyOpeningReminder(
    userId: string,
    policyId: string,
    policyName: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.POLICY_OPENING,
      title: '新政策开放申报',
      content: `您关注的政策「${policyName}」现已开放申报，点击查看详情。`,
      data: { policyId },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * 发送材料审核结果通知
   */
  async sendMaterialReviewResult(
    userId: string,
    applicationId: string,
    isApproved: boolean,
    feedback?: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.MATERIAL_REVIEW,
      title: isApproved ? '材料审核通过' : '材料需要修改',
      content: isApproved
        ? '您的申报材料已通过审核，可以继续后续流程。'
        : `您的申报材料需要修改，原因：${feedback || '请查看详情'}`,
      data: { applicationId, isApproved, feedback },
      channels: [NotificationChannel.IN_APP],
    });
  }

  /**
   * 发送申报结果通知
   */
  async sendApplicationResult(
    userId: string,
    applicationId: string,
    policyName: string,
    isApproved: boolean,
    amount?: number,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.APPLICATION_RESULT,
      title: isApproved ? '恭喜！申报成功' : '申报未通过',
      content: isApproved
        ? `您的「${policyName}」申报已通过审核${amount ? `，获批金额：${amount}万元` : ''}。`
        : `您的「${policyName}」申报未通过审核，请查看详情了解原因。`,
      data: { applicationId, isApproved, amount },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /**
   * 发送系统公告
   */
  async sendSystemAnnouncement(
    userIds: string[],
    title: string,
    content: string,
  ): Promise<Notification[]> {
    const notifications = userIds.map(userId => ({
      userId,
      type: NotificationType.SYSTEM,
      title,
      content,
      data: {},
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    }));

    return this.createNotifications(notifications);
  }

  /**
   * 清理过期通知（超过90天）
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(ninetyDaysAgo),
      isRead: true,
    });

    console.log(`清理了 ${result.affected} 条过期通知`);
  }
}
