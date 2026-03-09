import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Policy } from '../../entities/policy.entity';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('ai.openai.apiKey'),
      baseURL: this.configService.get('ai.openai.baseURL'),
    });
  }

  /**
   * 解析政策文本，提取结构化信息
   */
  async parsePolicyText(text: string): Promise<Partial<Policy>> {
    const prompt = `
你是一个专业的政策解析助手。请从以下政策文本中提取关键信息，并以JSON格式返回：

需要提取的字段：
- name: 政策名称
- category: 政策类别（国家高新技术企业/专精特新/研发补贴/人才政策/融资支持/税收优惠/知识产权/其他）
- level: 政策级别（国家级/省级/市级/区级）
- department: 发布部门
- description: 政策简介（100字以内）
- eligibility: 申报条件（数组）
- benefits: 政策奖励（数组，包含type类型、amount金额、description说明）
- materials: 所需材料（数组，包含name名称、required是否必需、description说明）
- applyStartDate: 申报开始日期（YYYY-MM-DD格式）
- applyEndDate: 申报截止日期（YYYY-MM-DD格式）

政策文本：
${text}

请直接返回JSON格式，不要包含其他说明文字。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model', 'gpt-4'),
        messages: [
          { role: 'system', content: '你是一个专业的政策解析助手，擅长从政策文本中提取结构化信息。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI返回内容为空');
      }

      // 解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('无法解析AI返回的JSON');
    } catch (error) {
      console.error('政策解析失败:', error);
      throw error;
    }
  }

  /**
   * 生成申报材料
   */
  async generateApplicationMaterial(
    materialType: string,
    enterpriseInfo: any,
    policyInfo: any,
  ): Promise<string> {
    const prompt = `
你是一个专业的政策申报顾问。请根据以下信息，为企业生成一份${materialType}。

企业信息：
${JSON.stringify(enterpriseInfo, null, 2)}

政策信息：
${JSON.stringify(policyInfo, null, 2)}

要求：
1. 内容专业、规范，符合政府申报要求
2. 突出企业的技术优势和创新能力
3. 结构清晰，逻辑严谨
4. 字数控制在2000-3000字

请直接生成文档内容，使用Markdown格式。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model', 'gpt-4'),
        messages: [
          { role: 'system', content: '你是一个专业的政策申报顾问，擅长撰写各类政府申报材料。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('材料生成失败:', error);
      throw error;
    }
  }

  /**
   * 智能问答
   */
  async chat(message: string, context?: string): Promise<string> {
    const messages: any[] = [
      {
        role: 'system',
        content: `你是一个专业的政策咨询助手，专门回答企业关于政府政策申报的问题。
${context ? '以下是相关背景信息：\n' + context : ''}
请用简洁专业的语言回答问题，如果无法确定，请建议用户咨询相关部门。`,
      },
      { role: 'user', content: message },
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model', 'gpt-4'),
        messages,
        temperature: 0.5,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('对话失败:', error);
      throw error;
    }
  }

  /**
   * 评估企业匹配度
   */
  async evaluateMatch(
    enterpriseInfo: any,
    policyInfo: any,
  ): Promise<{ score: number; reasons: string[] }> {
    const prompt = `
请评估以下企业与政策的匹配度，并给出评分和理由。

企业信息：
${JSON.stringify(enterpriseInfo, null, 2)}

政策信息：
${JSON.stringify(policyInfo, null, 2)}

请以JSON格式返回：
{
  "score": 匹配度分数(0-100),
  "reasons": ["匹配理由1", "匹配理由2", ...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model', 'gpt-4'),
        messages: [
          { role: 'system', content: '你是一个专业的政策匹配评估专家。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI返回内容为空');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('无法解析AI返回的JSON');
    } catch (error) {
      console.error('匹配评估失败:', error);
      throw error;
    }
  }

  /**
   * 生成政策摘要
   */
  async generateSummary(policyText: string): Promise<string> {
    const prompt = `
请为以下政策文本生成一个简洁的摘要（100字以内），突出核心内容和申报要点：

${policyText}

请直接返回摘要内容，不要包含其他说明。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('ai.openai.model', 'gpt-4'),
        messages: [
          { role: 'system', content: '你是一个专业的政策摘要生成助手。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('摘要生成失败:', error);
      throw error;
    }
  }
}