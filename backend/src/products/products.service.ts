import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { paginate, PaginationQueryDto } from '../common/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ListProductsQueryDto, type ProductSort } from './dto/list-products.query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

const IMAGE_INCLUDE = { images: { orderBy: { position: 'asc' as const } }, category: true };

const SORT_MAP: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: IMAGE_INCLUDE,
        orderBy: SORT_MAP[query.sort ?? 'newest'],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: IMAGE_INCLUDE });
    if (!product || product.deletedAt) throw new NotFoundException('Product not found');
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
    const existing = await this.findActiveOrThrow(id);
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

  // Soft delete — moves the product to the trash. Images and DB rows stay
  // put so it can be restored; nothing is touched in Storage until it's
  // permanently deleted from the trash.
  async remove(id: string) {
    await this.findActiveOrThrow(id);
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async listTrash(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductWhereInput = { deletedAt: { not: null } };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: IMAGE_INCLUDE,
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async restore(id: string) {
    await this.findTrashedOrThrow(id);
    return this.prisma.product.update({ where: { id }, data: { deletedAt: null }, include: IMAGE_INCLUDE });
  }

  // Permanent delete — only allowed from the trash, as a deliberate second
  // step. Actually removes the row (cascading its images) and cleans up
  // the image files in Storage.
  async permanentlyDelete(id: string) {
    const existing = await this.findTrashedOrThrow(id);
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(existing.images.map((img) => this.storage.deleteIfOwned(img.url)));
  }

  private async findActiveOrThrow(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!product || product.deletedAt) throw new NotFoundException('Product not found');
    return product;
  }

  private async findTrashedOrThrow(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: IMAGE_INCLUDE });
    if (!product || !product.deletedAt) throw new NotFoundException('Product not found in trash');
    return product;
  }

  private async assertSlugFree(slug: string, excludingId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }
}
