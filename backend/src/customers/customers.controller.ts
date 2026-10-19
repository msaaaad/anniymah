import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentCustomerId } from './current-customer-id.decorator.js';
import { CUSTOMER_SESSION_COOKIE, CustomerSessionService } from './customer-session.service.js';
import { CustomerSessionGuard } from './customer-session.guard.js';
import { CustomersService } from './customers.service.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customers: CustomersService,
    private readonly sessionService: CustomerSessionService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create a customer account, sets the session cookie' })
  @ApiResponse({ status: 201, description: 'Account created and logged in' })
  @ApiResponse({ status: 409, description: 'Phone/email already registered, or bad phone format' })
  async register(@Body() dto: RegisterCustomerDto, @Res({ passthrough: true }) res: Response) {
    const customer = await this.customers.register(dto);
    this.setSessionCookie(res, customer.id);
    return customer;
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Log in with phone/email + password, sets the session cookie' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginCustomerDto, @Res({ passthrough: true }) res: Response) {
    const customer = await this.customers.login(dto);
    this.setSessionCookie(res, customer.id);
    return customer;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear the session cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(CUSTOMER_SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(CustomerSessionGuard)
  @ApiCookieAuth(CUSTOMER_SESSION_COOKIE)
  @ApiOperation({ summary: 'Return the logged-in customer' })
  @ApiResponse({ status: 401, description: 'No valid session' })
  me(@CurrentCustomerId() customerId: string) {
    return this.customers.findById(customerId);
  }

  private setSessionCookie(res: Response, customerId: string) {
    const token = this.sessionService.createSessionToken(customerId);
    res.cookie(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
