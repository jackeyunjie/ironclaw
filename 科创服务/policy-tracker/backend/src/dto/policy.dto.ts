import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsArray,
  IsJSON,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PolicyCategory,
  PolicyLevel,
  PolicyStatus,
} from '../entities/policy.entity';

export class CreatePolicyDto {
  @ApiProperty({ description: '政策名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '政策编号' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ enum: PolicyCategory, description: '政策类别' })
  @IsEnum(PolicyCategory)
  category: PolicyCategory;

  @ApiProperty({ enum: PolicyLevel, description: '政策级别' })
  @IsEnum(PolicyLevel)
  level: PolicyLevel;

  @ApiProperty({ description: '发布部门' })
  @IsString()
  department: string;

  @ApiPropertyOptional({ description: '政策简介' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '申报条件', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibility?: string[];

  @ApiPropertyOptional({ description: '政策奖励' })
  @IsOptional()
  benefits?: {
    type: string;
    amount: string;
    description: string;
  }[];

  @ApiPropertyOptional({ description: '所需材料' })
  @IsOptional()
  materials?: {
    name: string;
    required: boolean;
    description: string;
    template?: string;
  }[];

  @ApiPropertyOptional({ description: '申报流程' })
  @IsOptional()
  process?: {
    step: number;
    title: string;
    description: string;
  }[];

  @ApiPropertyOptional({ description: '发布日期' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishDate?: Date;

  @ApiPropertyOptional({ description: '申报开始日期' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applyStartDate?: Date;

  @ApiPropertyOptional({ description: '申报截止日期' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  applyEndDate?: Date;

  @ApiPropertyOptional({ description: '政策有效期' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;

  @ApiPropertyOptional({ description: '官方链接' })
  @IsOptional()
  @IsString()
  officialUrl?: string;

  @ApiPropertyOptional({ description: '文档链接' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: '适用地区' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '适用行业', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];
}

export class UpdatePolicyDto extends CreatePolicyDto {}

export class PolicyQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: PolicyCategory, description: '政策类别' })
  @IsOptional()
  @IsEnum(PolicyCategory)
  category?: PolicyCategory;

  @ApiPropertyOptional({ enum: PolicyLevel, description: '政策级别' })
  @IsOptional()
  @IsEnum(PolicyLevel)
  level?: PolicyLevel;

  @ApiPropertyOptional({ enum: PolicyStatus, description: '政策状态' })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;

  @ApiPropertyOptional({ description: '适用地区' })
  @IsOptional()
  @IsString()
  region?: string;

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

export class PolicyMatchDto {
  @ApiProperty({ description: '企业ID' })
  @IsString()
  enterpriseId: string;

  @ApiPropertyOptional({ description: '匹配数量限制', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class PolicyResponseDto {
  id: string;
  name: string;
  code: string;
  category: PolicyCategory;
  level: PolicyLevel;
  department: string;
  description: string;
  eligibility: string[];
  benefits: any[];
  materials: any[];
  process: any[];
  publishDate: Date;
  applyStartDate: Date;
  applyEndDate: Date;
  validUntil: Date;
  officialUrl: string;
  documentUrl: string;
  status: PolicyStatus;
  region: string;
  industries: string[];
  viewCount: number;
  applyCount: number;
  matchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}