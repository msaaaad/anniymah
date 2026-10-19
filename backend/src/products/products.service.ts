import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

const IMAGE_INCLUDE = { images: { orderBy: { position: 'asc' as const } }, category: true };

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  list(categoryId?: string) {
    return this.prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: IMAGE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: IMAGE_INCLUDE });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    await this.assertSlugFree(dto.slug);
    const { images, categoryId, ...rest } = dto;

    return this.prisma.product.create({
      data: {
        ...rest,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        images: images?.length
          ? { create: images.map((url, position) => ({ url, position })) }
          : undefined,
      },
      include: IMAGE_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!existing) throw new NotFoundException('Product not found');
    if (dto.slug) await this.assertSlugFree(dto.slug, id);

    const { images, categoryId, ...rest } = dto;

    if (images) {
      const keptUrls = new Set(images);
      const removed = existing.images.filter((img) => !keptUrls.has(img.url));
      await Promise.all(removed.map((img) => this.storage.deleteIfOwned(img.url)));

      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await this.prisma.productImage.createMany({
          data: images.map((url, position) => ({ productId: id, url, position })),
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined && {
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        }),
      },
      include: IMAGE_INCLUDE,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!existing) throw new NotFoundException('Product not found');

    await this.prisma.product.delete({ where: { id } });
    await Promise.all(existing.images.map((img) => this.storage.deleteIfOwned(img.url)));
  }

  private async assertSlugFree(slug: string, excludingId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }
}
