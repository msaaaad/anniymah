import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto.js';
import { SESSION_COOKIE, SessionService } from './session.service.js';
import { SessionGuard } from './session.guard.js';

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('login')
  @HttpCode(200)
  // Much stricter than the global default — this is the one endpoint where
  // an attacker gets to guess a password, so it needs its own limit.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Log in with the admin email/password, sets the session cookie' })
  @ApiResponse({ status: 200, description: 'Logged in' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const email = body.email.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase();

    const emailMatches = this.sessionService.timingSafeEqual(email, adminEmail);
    const passwordMatches = this.sessionService.timingSafeEqual(body.password, process.env.ADMIN_PASSWORD ?? '');

    if (!emailMatches || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.sessionService.createSessionToken(adminEmail);
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear the session cookie' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOperation({ summary: 'Return the current admin session, if any' })
  @ApiResponse({ status: 200, description: 'Session is valid' })
  @ApiResponse({ status: 401, description: 'No valid session' })
  me(@Req() req: Request) {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const email = token?.split('|')[0];
    return { email };
  }
}
