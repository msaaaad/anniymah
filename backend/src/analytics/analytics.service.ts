import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled', 'rejected'] as const;
const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
const TOP_PRODUCTS_LIMIT = 5;

interface TopProductRow {
  productName: string;
  unitsSold: bigint;
  revenue: bigint;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async dashboard() {
    const { lowStockThreshold } = await this.settings.get();
    const monthStart = this.startOfCurrentMonthInDhaka();

    const [allTimeRevenue, monthRevenue, statusGroups, topProducts, outOfStockCount, lowStockCount] = await Promise.all([
      this.prisma.order.aggregate({ where: { status: 'delivered' }, _sum: { total: true } }),
      this.prisma.order.aggregate({
        where: { status: 'delivered', createdAt: { gte: monthStart } },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.topSellingProducts(),
      this.prisma.product.count({ where: { deletedAt: null, stock: { lte: 0 } } }),
      this.prisma.product.count({
        where: { deletedAt: null, stock: { gt: 0, lte: lowStockThreshold } },
      }),
    ]);

    const countByStatus = new Map(statusGroups.map((group) => [group.status, group._count._all]));
    const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, countByStatus.get(status) ?? 0]));

    return {
      revenue: {
        total: allTimeRevenue._sum.total ?? 0,
        thisMonth: monthRevenue._sum.total ?? 0,
      },
      ordersByStatus,
      totalOrders: statusGroups.reduce((sum, group) => sum + group._count._all, 0),
      topProducts,
      stock: { lowStockThreshold, lowStockCount, outOfStockCount },
    };
  }

  private async topSellingProducts() {
    const rows = await this.prisma.$queryRaw<TopProductRow[]>`
      SELECT oi.product_name AS "productName",
             SUM(oi.quantity) AS "unitsSold",
             SUM(oi.quantity * oi.unit_price) AS "revenue"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'delivered'
      GROUP BY oi.product_name
      ORDER BY "unitsSold" DESC, "revenue" DESC
      LIMIT ${TOP_PRODUCTS_LIMIT}
    `;

    return rows.map((row) => ({
      productName: row.productName,
      unitsSold: Number(row.unitsSold),
      revenue: Number(row.revenue),
    }));
  }

  private startOfCurrentMonthInDhaka(): Date {
    const dhakaNow = new Date(Date.now() + DHAKA_UTC_OFFSET_MS);
    const firstOfMonthUtcMs = Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), 1);
    return new Date(firstOfMonthUtcMs - DHAKA_UTC_OFFSET_MS);
  }
}
