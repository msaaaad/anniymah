import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LandingPagesController } from './landing-pages.controller.js';
import { LandingPagesService } from './landing-pages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LandingPagesController],
  providers: [LandingPagesService],
})
export class LandingPagesModule {}
