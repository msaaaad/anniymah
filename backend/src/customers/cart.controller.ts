import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { CurrentCustomerId } from './current-customer-id.decorator.js';
import { CUSTOMER_SESSION_COOKIE } from './customer-session.service.js';
import { CustomerSessionGuard } from './customer-session.guard.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';

@ApiTags('cart')
@ApiCookieAuth(CUSTOMER_SESSION_COOKIE)
@UseGuards(CustomerSessionGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the logged-in customer's cart" })
  get(@CurrentCustomerId() customerId: string) {
    return this.cart.getOrCreate(customerId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart (increments quantity if already present)' })
  addItem(@CurrentCustomerId() customerId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(customerId, dto.productId, dto.quantity);
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Set a cart item to an exact quantity' })
  updateItem(
    @CurrentCustomerId() customerId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(customerId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a product from the cart' })
  removeItem(@CurrentCustomerId() customerId: string, @Param('productId') productId: string) {
    return this.cart.removeItem(customerId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Empty the cart' })
  clear(@CurrentCustomerId() customerId: string) {
    return this.cart.clear(customerId);
  }
}
