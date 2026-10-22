import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
import { CustomerSessionService } from './customer-session.service.js';
import { CustomerSessionGuard } from './customer-session.guard.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController, CartController],
  providers: [CustomersService, CustomerSessionService, CustomerSessionGuard, CartService],
  exports: [CustomerSessionService, CustomerSessionGuard, CartService],
})
export class CustomersModule {}
