import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Product } from '../generated/prisma/client.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { isValidBangladeshiPhone, normalizePhone } from './phone.util.js';

const ORDER_INCLUDE = { items: true };

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    if (!isValidBangladeshiPhone(dto.phone)) {
      throw new BadRequestException('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)');
    }

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.active) {
        throw new BadRequestException(`Product ${item.productId} is not available`);
      }
    }

    // Delivery is charged once per order, not once per item — the charge is
    // the highest per-zone charge among the paid (non-free-delivery) items,
    // never a sum of all of them.
    const paidProducts = dto.items
      .map((item) => productMap.get(item.productId) as Product)
      .filter((product) => !product.freeDelivery);

    let deliveryZone: 'inside_dhaka' | 'outside_dhaka' | null = null;
    let deliveryCharge = 0;

    if (paidProducts.length > 0) {
      if (dto.deliveryZone !== 'inside_dhaka' && dto.deliveryZone !== 'outside_dhaka') {
        throw new BadRequestException('Please select a delivery area');
      }
      deliveryZone = dto.deliveryZone;
      deliveryCharge = Math.max(
        ...paidProducts.map((product) =>
          deliveryZone === 'inside_dhaka' ? product.deliveryChargeInsideDhaka : product.deliveryChargeOutsideDhaka,
        ),
      );
    }

    const itemsTotal = dto.items.reduce((sum, item) => {
      const product = productMap.get(item.productId) as Product;
      return sum + product.price * item.quantity;
    }, 0);

    return this.prisma.order.create({
      data: {
        customerName: dto.customerName.trim(),
        phone: normalizePhone(dto.phone),
        address: dto.address.trim(),
        notes: dto.notes?.trim() ?? '',
        deliveryZone,
        deliveryCharge,
        total: itemsTotal + deliveryCharge,
        items: {
          create: dto.items.map((item) => {
            const product = productMap.get(item.productId) as Product;
            return {
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  list(query: ListOrdersQueryDto) {
    return this.prisma.order.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.search && {
          OR: [
            { customerName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.status === 'confirmed' && { confirmedAt: new Date() }),
        },
        include: ORDER_INCLUDE,
      });
    } catch {
      throw new NotFoundException('Order not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.order.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Order not found');
    }
  }
}
