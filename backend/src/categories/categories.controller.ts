import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { PaginationQueryDto } from '../common/pagination.dto.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories (public — used by the storefront)' })
  list() {
    return this.categories.list();
  }

  @Get('trash')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'List soft-deleted categories, paginated (admin only)' })
  listTrash(@Query() query: PaginationQueryDto) {
    return this.categories.listTrash(query);
  }

  @Post('trash/:id/restore')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Restore a soft-deleted category out of the trash (admin only)' })
  @ApiResponse({ status: 404, description: 'Not in trash' })
  restore(@Param('id') id: string) {
    return this.categories.restore(id);
  }

  @Delete('trash/:id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Permanently delete a category from the trash (admin only) — cannot be undone' })
  @ApiResponse({ status: 204, description: 'Permanently deleted' })
  @ApiResponse({ status: 404, description: 'Not in trash' })
  permanentlyDelete(@Param('id') id: string) {
    return this.categories.permanentlyDelete(id);
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Create a category (admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Update a category (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Soft-delete a category (admin only) — moves it to the trash, see GET /categories/trash' })
  @ApiResponse({ status: 204, description: 'Moved to trash' })
  softDelete(@Param('id') id: string) {
    return this.categories.softDelete(id);
  }
}
