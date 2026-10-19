import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { PaginationQueryDto } from '../common/pagination.dto.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto } from './dto/list-products.query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products — paginated, searchable, filterable by category, sortable (public)' })
  list(@Query() query: ListProductsQueryDto) {
    return this.products.list(query);
  }

  // Must come before GET /products/:slug or "trash" would be parsed as a slug.
  @Get('trash')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'List soft-deleted products, paginated (admin only)' })
  listTrash(@Query() query: PaginationQueryDto) {
    return this.products.listTrash(query);
  }

  @Post('trash/:id/restore')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Restore a soft-deleted product out of the trash (admin only)' })
  @ApiResponse({ status: 404, description: 'Not in trash' })
  restore(@Param('id') id: string) {
    return this.products.restore(id);
  }

  @Delete('trash/:id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Permanently delete a product from the trash (admin only) — cannot be undone' })
  @ApiResponse({ status: 204, description: 'Permanently deleted' })
  @ApiResponse({ status: 404, description: 'Not in trash' })
  permanentlyDelete(@Param('id') id: string) {
    return this.products.permanentlyDelete(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single product by slug (public — product detail page)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Create a product (admin only) — upload images via POST /uploads first' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({
    summary: 'Update a product (admin only) — passing `images` replaces the full set and ' +
      'deletes any removed images from storage',
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Soft-delete a product (admin only) — moves it to the trash, see GET /products/trash' })
  @ApiResponse({ status: 204, description: 'Moved to trash' })
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
