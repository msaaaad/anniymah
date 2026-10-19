import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto.js';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto.js';
import { HeroBannersService } from './hero-banners.service.js';

@ApiTags('hero-banners')
@Controller('hero-banners')
export class HeroBannersController {
  constructor(private readonly heroBanners: HeroBannersService) {}

  @Get()
  @ApiOperation({ summary: 'List hero banners by position (public — storefront homepage)' })
  list() {
    return this.heroBanners.list();
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Create a hero banner (admin only) — upload the image via POST /uploads first' })
  @ApiResponse({ status: 201, description: 'Created' })
  create(@Body() dto: CreateHeroBannerDto) {
    return this.heroBanners.create(dto);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Update a hero banner (admin only) — replacing imageUrl deletes the old image from storage' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() dto: UpdateHeroBannerDto) {
    return this.heroBanners.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Delete a hero banner (admin only) — also deletes its image from storage' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.heroBanners.remove(id);
  }
}
