import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsNumber,
  IsInt,
  IsArray,
  IsJSON,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnterpriseScale } from '../entities/enterprise.entity';

export class CreateEnterpriseDto {
  @ApiProperty({ description: '企业名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '统一社会信用代码' })
  @IsString()
  creditCode: string;

  @ApiPropertyOptional({ description: '所属行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ enum: EnterpriseScale, description: '企业规模' })
  @IsEnum(EnterpriseScale)
  scale: EnterpriseScale;

  @ApiPropertyOptional({ description: '注册日期' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registerDate?: Date;

  @ApiPropertyOptional({ description: '注册资本' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  registerCapital?: number;

  @ApiPropertyOptional({ description: '员工人数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employees?: number;

  @ApiPropertyOptional({ description: '注册地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '省份' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '区县' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '已有资质', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @ApiPropertyOptional({ description: '知识产权情况' })
  @IsOptional()
  intellectualProperty?: {
    patents: number;
    softwareCopyrights: number;
    trademarks: number;
  };

  @ApiPropertyOptional({ description: '年营收' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  annualRevenue?: number;

  @ApiPropertyOptional({ description: '研发费用' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rdExpense?: number;

  @ApiPropertyOptional({ description: '研发占比' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  rdRatio?: number;

  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: '联系人电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '联系人邮箱' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class UpdateEnterpriseDto extends CreateEnterpriseDto {}

export class EnterpriseQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: EnterpriseScale, description: '企业规模' })
  @IsOptional()
  @IsEnum(EnterpriseScale)
  scale?: EnterpriseScale;

  @ApiPropertyOptional({ description: '所属行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class EnterpriseResponseDto {
  id: string;
  name: string;
  creditCode: string;
  industry: string;
  scale: EnterpriseScale;
  registerDate: Date;
  registerCapital: number;
  employees: number;
  address: string;
  province: string;
  city: string;
  district: string;
  qualifications: string[];
  intellectualProperty: {
    patents: number;
    softwareCopyrights: number;
    trademarks: number;
  };
  annualRevenue: number;
  rdExpense: number;
  rdRatio: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  trackedPolicyIds: string[];
  notificationSettings: {
    email: boolean;
    sms: boolean;
    wechat: boolean;
    advanceDays: number;
  };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}