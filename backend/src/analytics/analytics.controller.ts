import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { AnalyticsService } from './analytics.service.js';
import { DashboardQueryDto } from './dto/dashboard.query.dto.js';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({
    summary:
      'Dashboard summary (admin only): revenue from delivered orders, order counts by status, daily orders and revenue for a chart, top 5 products by units sold (latest 5 products when nothing has sold), low and out of stock counts',
  })
  dashboard(@Query() query: DashboardQueryDto) {
    return this.analytics.dashboard(query.days);
  }
}
