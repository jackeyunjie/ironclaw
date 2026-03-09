import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ScraperService } from './scraper.service';

class ManualScrapeDto {
  sources?: string[];
}

@ApiTags('政策爬虫')
@Controller('scraper')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('run')
  @ApiOperation({ summary: '手动触发政策抓取' })
  @ApiResponse({ status: HttpStatus.OK, description: '抓取成功' })
  async manualScrape(@Body() dto: ManualScrapeDto) {
    const results = await this.scraperService.manualScrape(dto.sources);
    return {
      data: results,
      message: '政策抓取完成',
    };
  }

  @Get('sources')
  @ApiOperation({ summary: '获取可用抓取源' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  async getSources() {
    return {
      data: [
        { id: 'beijing', name: '北京市科技政策', description: '北京市科委政策' },
        { id: 'zhongguancun', name: '中关村政策', description: '中关村示范区政策' },
        { id: 'national', name: '国家级政策', description: '国家高新技术企业等' },
      ],
    };
  }
}
