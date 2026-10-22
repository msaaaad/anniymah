import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateLandingPageDto } from './dto/create-landing-page.dto.js';
import { UpdateLandingPageDto } from './dto/update-landing-page.dto.js';

@Injectable()
export class LandingPagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  list() {
    return this.prisma.landingPage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.landingPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async findById(id: string) {
    const page = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Landing page not found');
    return page;
  }

  async create(dto: CreateLandingPageDto) {
    await this.assertSlugAvailable(dto.slug);
    return this.prisma.landingPage.create({ data: dto });
  }

  async update(id: string, dto: UpdateLandingPageDto) {
    const existing = await this.findById(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.assertSlugAvailable(dto.slug);
    }
    if (dto.imageUrl !== undefined && dto.imageUrl !== existing.imageUrl && existing.imageUrl) {
      await this.storage.deleteIfOwned(existing.imageUrl);
    }

    return this.prisma.landingPage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    await this.prisma.landingPage.delete({ where: { id } });
    if (existing.imageUrl) await this.storage.deleteIfOwned(existing.imageUrl);
  }

  private async assertSlugAvailable(slug: string) {
    const taken = await this.prisma.landingPage.findUnique({ where: { slug } });
    if (taken) throw new ConflictException('A landing page with this slug already exists');
  }
}
