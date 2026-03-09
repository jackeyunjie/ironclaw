import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

class ParsePolicyDto {
  text: string;
}

class GenerateMaterialDto {
  materialType: string;
  enterpriseInfo: any;
  policyInfo: any;
}

class ChatDto {
  message: string;
  context?: string;
}

class EvaluateMatchDto {
  enterpriseInfo: any;
  policyInfo: any;
}

@ApiTags('AI能力')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-policy')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '解析政策文本' })
  @ApiResponse({ status: HttpStatus.OK, description: '解析成功' })
  async parsePolicy(@Body() dto: ParsePolicyDto) {
    const result = await this.aiService.parsePolicyText(dto.text);
    return {
      data: result,
      message: '解析成功',
    };
  }

  @Post('generate-material')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成申报材料' })
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  async generateMaterial(@Body() dto: GenerateMaterialDto) {
    const result = await this.aiService.generateApplicationMaterial(
      dto.materialType,
      dto.enterpriseInfo,
      dto.policyInfo,
    );
    return {
      data: { content: result },
      message: '生成成功',
    };
  }

  @Post('chat')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '智能问答' })
  @ApiResponse({ status: HttpStatus.OK, description: '回答成功' })
  async chat(@Body() dto: ChatDto) {
    const result = await this.aiService.chat(dto.message, dto.context);
    return {
      data: { reply: result },
      message: 'success',
    };
  }

  @Post('evaluate-match')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '评估企业政策匹配度' })
  @ApiResponse({ status: HttpStatus.OK, description: '评估成功' })
  async evaluateMatch(@Body() dto: EvaluateMatchDto) {
    const result = await this.aiService.evaluateMatch(
      dto.enterpriseInfo,
      dto.policyInfo,
    );
    return {
      data: result,
      message: '评估成功',
    };
  }

  @Post('generate-summary')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成政策摘要' })
  @ApiResponse({ status: HttpStatus.OK, description: '生成成功' })
  async generateSummary(@Body('text') text: string) {
    const result = await this.aiService.generateSummary(text);
    return {
      data: { summary: result },
      message: '生成成功',
    };
  }
}