import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';

const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled', 'rejected'] as const;
const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TOP_PRODUCTS_LIMIT = 5;
const DEFAULT_SALES_DAYS = 30;

interface TopProductRow {
  productName: string;
  unitsSold: bigint;
  revenue: bigint;
}

interface DailySalesRow {
  day: string;
  orders: bigint;
  revenue: bigint;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async dashboard(days = DEFAULT_SALES_DAYS) {
    const { lowStockThreshold } = await this.settings.get();
    const monthStart = this.startOfCurrentMonthInDhaka();

    const [allTimeRevenue, monthRevenue, statusGroups, bestSellers, salesOverTime, outOfStockCount, lowStockCount] =
      await Promise.all([
        this.prisma.order.aggregate({ where: { status: 'delivered' }, _sum: { total: true } }),
        this.prisma.order.aggregate({
          where: { status: 'delivered', createdAt: { gte: monthStart } },
          _sum: { total: true },
        }),
        this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
        this.topSellingProducts(),
        this.dailySales(days),
        this.prisma.product.count({ where: { deletedAt: null, stock: { lte: 0 } } }),
        this.prisma.product.count({
          where: { deletedAt: null, stock: { gt: 0, lte: lowStockThreshold } },
        }),
      ]);

    const countByStatus = new Map(statusGroups.map((group) => [group.status, group._count._all]));
    const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, countByStatus.get(status) ?? 0]));

    const hasSales = bestSellers.length > 0;
    const topProducts = hasSales ? bestSellers : await this.latestProducts();

    return {
      revenue: {
        total: allTimeRevenue._sum.total ?? 0,
        thisMonth: monthRevenue._sum.total ?? 0,
      },
      ordersByStatus,
      totalOrders: statusGroups.reduce((sum, group) => sum + group._count._all, 0),
      topProductsSource: hasSales ? 'sales' : 'latest',
      topProducts,
      salesOverTime,
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

  private async latestProducts() {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, active: true },
      orderBy: { createdAt: 'desc' },
      take: TOP_PRODUCTS_LIMIT,
      select: { name: true },
    });
    return products.map((product) => ({ productName: product.name, unitsSold: 0, revenue: 0 }));
  }

  private async dailySales(days: number) {
    const dates = this.lastDatesInDhaka(days);
    const rangeStartUtc = new Date(Date.parse(`${dates[0]}T00:00:00Z`) - DHAKA_UTC_OFFSET_MS);

    const rows = await this.prisma.$queryRaw<DailySalesRow[]>`
      SELECT to_char((o.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dhaka')::date, 'YYYY-MM-DD') AS "day",
             COUNT(*) AS "orders",
             COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total END), 0) AS "revenue"
      FROM orders o
      WHERE o.created_at >= ${rangeStartUtc}
      GROUP BY "day"
    `;

    const byDay = new Map(rows.map((row) => [row.day, row]));
    return dates.map((date) => ({
      date,
      orders: Number(byDay.get(date)?.orders ?? 0),
      revenue: Number(byDay.get(date)?.revenue ?? 0),
    }));
  }

  private lastDatesInDhaka(days: number): string[] {
    const todayDhakaMs = Date.parse(new Date(Date.now() + DHAKA_UTC_OFFSET_MS).toISOString().slice(0, 10));
    return Array.from({ length: days }, (_, index) =>
      new Date(todayDhakaMs - (days - 1 - index) * ONE_DAY_MS).toISOString().slice(0, 10),
    );
  }

  private startOfCurrentMonthInDhaka(): Date {
    const dhakaNow = new Date(Date.now() + DHAKA_UTC_OFFSET_MS);
    const firstOfMonthUtcMs = Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), 1);
    return new Date(firstOfMonthUtcMs - DHAKA_UTC_OFFSET_MS);
  }
}
