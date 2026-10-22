import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { CreateLandingPageDto } from './dto/create-landing-page.dto.js';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto.js';
import { LandingPagesService } from './landing-pages.service.js';

@ApiTags('landing-pages')
@Controller('landing-pages')
export class LandingPagesController {
  constructor(private readonly landingPages: LandingPagesService) {}

  @Get()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'List all landing pages (admin only)' })
  list() {
    return this.landingPages.list();
  }

  @Get('by-id/:id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Get one landing page by id (admin only)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.landingPages.findById(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a landing page by slug (public)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.landingPages.findBySlug(slug);
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Create a landing page (admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateLandingPageDto) {
    return this.landingPages.create(dto);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Update a landing page (admin only), replacing imageUrl deletes the old image from storage' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLandingPageDto) {
    return this.landingPages.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Delete a landing page (admin only), also deletes its image from storage' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.landingPages.remove(id);
  }
}
