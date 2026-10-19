import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StorageModule } from './storage/storage.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { HeroBannersModule } from './hero-banners/hero-banners.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Generous global default (60 req/min/IP) — routes that need a tighter
    // limit (e.g. login) override it with their own @Throttle().
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    PrismaModule,
    StorageModule,
    HealthModule,
    AuthModule,
    UploadsModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    HeroBannersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
