import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { CartService } from '../customers/cart.service.js';
import { CUSTOMER_SESSION_COOKIE, CustomerSessionService } from '../customers/customer-session.service.js';
import { CreateLandingPageOrderDto } from './dto/create-landing-page-order.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly customerSession: CustomerSessionService,
    private readonly cart: CartService,
  ) {}

  @Post('landing-page')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Place an order from a landing page' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Invalid phone or missing fields' })
  async createLandingPage(@Body() dto: CreateLandingPageOrderDto) {
    if (this.honeypotFieldWasFilled(dto)) {
      return { ok: true };
    }
    return this.orders.createLandingPageOrder(dto);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Place an order (public — storefront checkout; attaches the customer if logged in)' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Invalid phone, unavailable product, or missing delivery zone' })
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    if (this.honeypotFieldWasFilled(dto)) {
      return { ok: true };
    }

    const customerId = this.resolveOptionalLoggedInCustomerId(req);
    const order = await this.orders.create(dto, customerId);
    if (customerId) await this.cart.clear(customerId);
    return order;
  }

  private honeypotFieldWasFilled(dto: { company?: string }): boolean {
    return Boolean(dto.company && dto.company.trim() !== '');
  }

  private resolveOptionalLoggedInCustomerId(req: Request): string | undefined {
    const customerToken = req.cookies?.[CUSTOMER_SESSION_COOKIE] as string | undefined;
    return this.customerSession.verifySessionToken(customerToken) ?? undefined;
  }

  @Get()
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'List orders (admin only), optionally filtered by status or search' })
  list(@Query() query: ListOrdersQueryDto) {
    return this.orders.list(query);
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Update an order status (admin only)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Delete an order (admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  remove(@Param('id') id: string) {
    return this.orders.remove(id);
  }
}
