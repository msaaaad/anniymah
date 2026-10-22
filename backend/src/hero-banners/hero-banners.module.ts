import { Module } from '@nestjs/common';
import { HeroBannersController } from './hero-banners.controller.js';
import { HeroBannersService } from './hero-banners.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HeroBannersController],
  providers: [HeroBannersService],
})
export class HeroBannersModule {}
