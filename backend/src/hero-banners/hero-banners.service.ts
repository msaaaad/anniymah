import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto.js';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto.js';

@Injectable()
export class HeroBannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  list() {
    return this.prisma.heroBanner.findMany({ orderBy: { position: 'asc' } });
  }

  create(dto: CreateHeroBannerDto) {
    return this.prisma.heroBanner.create({ data: dto });
  }

  async update(id: string, dto: UpdateHeroBannerDto) {
    const existing = await this.prisma.heroBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Hero banner not found');

    if (dto.imageUrl && dto.imageUrl !== existing.imageUrl) {
      await this.storage.deleteIfOwned(existing.imageUrl);
    }

    return this.prisma.heroBanner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.heroBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Hero banner not found');

    await this.prisma.heroBanner.delete({ where: { id } });
    await this.storage.deleteIfOwned(existing.imageUrl);
  }
}
