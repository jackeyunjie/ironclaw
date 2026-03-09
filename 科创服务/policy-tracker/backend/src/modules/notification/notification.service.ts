import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { Notification, NotificationType, NotificationChannel } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { Enterprise } from '../../entities/enterprise.entity';
import { Policy } from '../../entities/policy.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enterprise)
    private enterpriseRepository: Repository<Enterprise>,
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    private configService: ConfigService,
  ) {
    this.initEmailTransporter();
  }

  private initEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.163.com'),
      port: this.configService.get('SMTP_PORT', 465),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  /**
   * 创建通知
   */
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    const saved = await this.notificationRepository.save(notification);

    // 异步发送多渠道通知
    this.sendNotification(saved).catch(err => {
      this.logger.error(`发送通知失败: ${err.message}`, err.stack);
    });

    return saved;
  }

  /**
   * 发送通知到各渠道
   */
  private async sendNotification(notification: Notification): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: notification.userId },
    });

    if (!user) return;

    const channels = notification.channels || [NotificationChannel.IN_APP];

    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.EMAIL:
            await this.sendEmail(user.email, notification);
            break;
          case NotificationChannel.SMS:
            await this.sendSms(user.phone, notification);
            break;
          case NotificationChannel.WECHAT:
            await this.sendWechat(user.id, notification);
            break;
        }
      } catch (error) {
        this.logger.error(
          `发送${channel}通知失败: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  private async sendEmail(email: string, notification: Notification): Promise<void> {
    if (!email) return;

    const htmlContent = this.generateEmailTemplate(notification);

    await this.emailTransporter.sendMail({
      from: this.configService.get('SMTP_FROM', '科创服务 <noreply@example.com>'),
      to: email,
      subject: notification.title,
      html: htmlContent,
    });

    this.logger.log(`邮件通知已发送至 ${email}`);
  }

  private async sendSms(phone: string, notification: Notification): Promise<void> {
    if (!phone) return;
    // TODO: 集成阿里云/腾讯云短信服务
    this.logger.log(`短信通知将发送至 ${phone}: ${notification.title}`);
  }

  private async sendWechat(userId: string, notification: Notification): Promise<void> {
    // TODO: 集成微信模板消息
    this.logger.log(`微信通知将发送至用户 ${userId}`);
  }

  private generateEmailTemplate(notification: Notification): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">科创服务政策平台</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #262626; margin: 0 0 20px 0; font-size: 18px;">${notification.title}</h2>
          <p style="color: #595959; line-height: 1.8; font-size: 14px;">${notification.content}</p>
          ${notification.data?.policyId ? `
          <div style="margin-top: 20px; text-align: center;">
            <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/policies/${notification.data.policyId}"
               style="display: inline-block; background: #1890ff; color: #fff; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              查看详情
            </a>
          </div>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 30px 0;">
          <p style="color: #8c8c8c; font-size: 12px; text-align: center; margin: 0;">
            此邮件由系统自动发送，请勿回复<br>
            科创服务政策平台 © ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `;
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
   * 定时任务：每天上午9点发送政策截止提醒
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPolicyClosingReminders(): Promise<void> {
    this.logger.log('开始发送政策截止提醒...');

    const enterprises = await this.enterpriseRepository.find({
      where: { notificationSettings: () => "notification_settings IS NOT NULL" },
    });

    for (const enterprise of enterprises) {
      if (!enterprise.trackedPolicyIds?.length) continue;

      const settings = enterprise.notificationSettings || { advanceDays: 7, email: true, sms: false, wechat: false };
      const advanceDays = settings.advanceDays || 7;

      const now = new Date();
      const reminderDate = new Date();
      reminderDate.setDate(now.getDate() + advanceDays);

      const closingPolicies = await this.policyRepository.find({
        where: {
          id: () => `id IN (${enterprise.trackedPolicyIds.map(id => `'${id}'`).join(',')})`,
          applyEndDate: LessThanOrEqual(reminderDate),
        },
      });

      for (const policy of closingPolicies) {
        const daysRemaining = Math.ceil(
          (new Date(policy.applyEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        const channels: NotificationChannel[] = [NotificationChannel.IN_APP];
        if (settings.email) channels.push(NotificationChannel.EMAIL);
        if (settings.sms) channels.push(NotificationChannel.SMS);
        if (settings.wechat) channels.push(NotificationChannel.WECHAT);

        await this.createNotification({
          userId: enterprise.userId,
          type: NotificationType.POLICY_CLOSING,
          title: `【提醒】${policy.name} 即将截止申报`,
          content: `您关注的政策 "${policy.name}" 将在 ${daysRemaining} 天后截止申报，请及时准备材料并提交申请。`,
          channels,
          data: {
            policyId: policy.id,
            daysRemaining,
          },
        });
      }
    }

    this.logger.log('政策截止提醒发送完成');
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

    this.logger.log(`清理了 ${result.affected} 条过期通知`);
  }
}
