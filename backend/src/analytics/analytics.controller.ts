import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { AnalyticsService } from './analytics.service.js';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({
    summary:
      'Dashboard summary (admin only): revenue from delivered orders, order counts by status, top 5 products by units sold, low and out of stock counts',
  })
  dashboard() {
    return this.analytics.dashboard();
  }
}
