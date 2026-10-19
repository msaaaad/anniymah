import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.promotion.findMany({ orderBy: { startsAt: 'desc' } });
  }

  async getHighestDiscountActiveNow() {
    const now = new Date();
    const candidates = await this.prisma.promotion.findMany({
      where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { discountPercent: 'desc' },
      take: 1,
    });
    return candidates[0] ?? null;
  }

  create(dto: CreatePromotionDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(startsAt.getTime() + dto.durationDays * ONE_DAY_MS);

    return this.prisma.promotion.create({
      data: {
        name: dto.name,
        discountPercent: dto.discountPercent,
        startsAt,
        endsAt,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promotion not found');

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const durationMs = dto.durationDays
      ? dto.durationDays * ONE_DAY_MS
      : existing.endsAt.getTime() - existing.startsAt.getTime();

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...((dto.startsAt || dto.durationDays) && {
          startsAt,
          endsAt: new Date(startsAt.getTime() + durationMs),
        }),
      },
    });
  }

  async remove(id: string) {
    try {
      await this.prisma.promotion.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Promotion not found');
    }
  }
}
