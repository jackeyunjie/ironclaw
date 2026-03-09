import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import {
  CreatePolicyDto,
  UpdatePolicyDto,
  PolicyQueryDto,
  PolicyResponseDto,
  PolicyMatchDto,
} from '../../dto/policy.dto';
import { Policy } from '../../entities/policy.entity';

@ApiTags('政策管理')
@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post()
  @ApiOperation({ summary: '创建政策' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '政策创建成功',
    type: PolicyResponseDto,
  })
  async create(@Body() createPolicyDto: CreatePolicyDto): Promise<Policy> {
    return this.policyService.create(createPolicyDto);
  }

  @Get()
  @ApiOperation({ summary: '获取政策列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取政策列表成功',
  })
  async findAll(@Query() query: PolicyQueryDto) {
    return this.policyService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: '获取即将开始的政策' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取即将开始的政策成功',
  })
  async getUpcomingPolicies(@Query('days') days?: number) {
    return this.policyService.getUpcomingPolicies(days);
  }

  @Get('closing')
  @ApiOperation({ summary: '获取即将截止的政策' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取即将截止的政策成功',
  })
  async getClosingPolicies(@Query('days') days?: number) {
    return this.policyService.getClosingPolicies(days);
  }

  @Get('match')
  @ApiOperation({ summary: '获取企业匹配的政策' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取匹配政策成功',
  })
  async matchPolicies(@Query() matchDto: PolicyMatchDto) {
    const policies = await this.policyService.matchPoliciesForEnterprise(
      matchDto.enterpriseId,
      matchDto.limit,
    );
    return {
      items: policies,
      total: policies.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取政策详情' })
  @ApiParam({ name: 'id', description: '政策ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取政策详情成功',
    type: PolicyResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Policy> {
    return this.policyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新政策' })
  @ApiParam({ name: 'id', description: '政策ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '政策更新成功',
    type: PolicyResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ): Promise<Policy> {
    return this.policyService.update(id, updatePolicyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除政策' })
  @ApiParam({ name: 'id', description: '政策ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '政策删除成功',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.policyService.remove(id);
  }
}