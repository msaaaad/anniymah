import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { CustomersModule } from '../customers/customers.module.js';

@Module({
  imports: [AuthModule, CustomersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
