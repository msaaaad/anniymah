import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Product } from '../generated/prisma/client.js';
import { applyDiscount } from '../promotions/promotion-price.util.js';
import { PromotionsService } from '../promotions/promotions.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { isValidBangladeshiPhone, normalizePhone } from '../common/phone.util.js';

const ORDER_INCLUDE = { items: true };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promotions: PromotionsService,
  ) {}

  async create(dto: CreateOrderDto, customerId?: string) {
    if (!isValidBangladeshiPhone(dto.phone)) {
      throw new BadRequestException('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)');
    }

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const [products, activePromotion] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: productIds } } }),
      this.promotions.getHighestDiscountActiveNow(),
    ]);
    const productMap = new Map(products.map((p) => [p.id, p]));
    const priceFor = (product: Product) => applyDiscount(product.price, activePromotion);

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.active || product.deletedAt) {
        throw new BadRequestException(`Product ${item.productId} is not available`);
      }
    }

    const { zone: deliveryZone, charge: deliveryCharge } = this.highestDeliveryChargeAcrossItems(
      dto.items.map((item) => productMap.get(item.productId) as Product),
      dto.deliveryZone,
    );

    const itemsTotal = dto.items.reduce((sum, item) => {
      const product = productMap.get(item.productId) as Product;
      return sum + priceFor(product) * item.quantity;
    }, 0);

    return this.prisma.order.create({
      data: {
        customerId,
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
              unitPrice: priceFor(product),
              quantity: item.quantity,
            };
          }),
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  private highestDeliveryChargeAcrossItems(
    products: Product[],
    requestedZone: 'inside_dhaka' | 'outside_dhaka' | undefined,
  ): { zone: 'inside_dhaka' | 'outside_dhaka' | null; charge: number } {
    const paidProducts = products.filter((product) => !product.freeDelivery);
    if (paidProducts.length === 0) {
      return { zone: null, charge: 0 };
    }

    if (requestedZone !== 'inside_dhaka' && requestedZone !== 'outside_dhaka') {
      throw new BadRequestException('Please select a delivery area');
    }

    const chargeFor = (product: Product) =>
      requestedZone === 'inside_dhaka' ? product.deliveryChargeInsideDhaka : product.deliveryChargeOutsideDhaka;

    return { zone: requestedZone, charge: Math.max(...paidProducts.map(chargeFor)) };
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
