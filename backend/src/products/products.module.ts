import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { PromotionsModule } from '../promotions/promotions.module.js';

@Module({
  imports: [AuthModule, PromotionsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
