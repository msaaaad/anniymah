import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { SettingsService } from './settings.service.js';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get store settings (public, used by the storefront for contact info and the announcement banner)' })
  get() {
    return this.settings.get();
  }

  @Patch()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Update store settings (admin only), only sent fields change' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
