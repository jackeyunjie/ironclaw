import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicationTask } from '../../entities/application-task.entity';
import { Policy } from '../../entities/policy.entity';
import { Enterprise } from '../../entities/enterprise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationTask, Policy, Enterprise])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}