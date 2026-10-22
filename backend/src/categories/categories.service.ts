import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { paginate, PaginationQueryDto } from '../common/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async create(dto: CreateCategoryDto) {
    await this.assertSlugFree(dto.slug);
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findActiveOrThrow(id);
    if (dto.slug) await this.assertSlugFree(dto.slug, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    await this.findActiveOrThrow(id);
    await this.prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async listTrash(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { deletedAt: { not: null } };

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async restore(id: string) {
    await this.findTrashedOrThrow(id);
    return this.prisma.category.update({ where: { id }, data: { deletedAt: null } });
  }

  async permanentlyDelete(id: string) {
    await this.findTrashedOrThrow(id);
    await this.prisma.category.delete({ where: { id } });
  }

  private async findActiveOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || category.deletedAt) throw new NotFoundException('Category not found');
    return category;
  }

  private async findTrashedOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || !category.deletedAt) throw new NotFoundException('Category not found in trash');
    return category;
  }

  private async assertSlugFree(slug: string, excludingId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }
}
