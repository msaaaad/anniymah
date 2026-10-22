import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const CART_INCLUDE = { items: { include: { product: { include: { images: true } } } } };
const MAX_QUANTITY = 20;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(customerId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId }, include: CART_INCLUDE });
    if (cart) return cart;
    return this.prisma.cart.create({ data: { customerId }, include: CART_INCLUDE });
  }

  async addItem(customerId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active || product.deletedAt) {
      throw new BadRequestException('Product is not available');
    }

    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      create: { customerId },
      update: {},
    });

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + quantity, MAX_QUANTITY) },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: Math.min(quantity, MAX_QUANTITY) },
      });
    }

    return this.getOrCreate(customerId);
  }

  async updateItem(customerId: string, productId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Cart is empty');

    const result = await this.prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId },
      data: { quantity },
    });
    if (result.count === 0) throw new NotFoundException('Item not in cart');

    return this.getOrCreate(customerId);
  }

  async removeItem(customerId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new NotFoundException('Cart is empty');

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.getOrCreate(customerId);
  }

  async clear(customerId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { customerId } });
    if (!cart) return this.getOrCreate(customerId);

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreate(customerId);
  }
}
