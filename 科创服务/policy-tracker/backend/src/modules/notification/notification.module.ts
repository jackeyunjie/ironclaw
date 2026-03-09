import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { Enterprise } from '../../entities/enterprise.entity';
import { Policy } from '../../entities/policy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Enterprise, Policy]),
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
