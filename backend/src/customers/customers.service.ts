import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { isValidBangladeshiPhone, normalizePhone } from '../common/phone.util.js';
import { RegisterCustomerDto } from './dto/register-customer.dto.js';
import { LoginCustomerDto } from './dto/login-customer.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterCustomerDto) {
    if (!isValidBangladeshiPhone(dto.phone)) {
      throw new BadRequestException('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)');
    }
    const phone = normalizePhone(dto.phone);
    const email = dto.email?.trim().toLowerCase();

    const existing = await this.prisma.customer.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) {
      throw new ConflictException('An account with this phone or email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const customer = await this.prisma.customer.create({
      data: {
        phone,
        email,
        name: dto.name?.trim() ?? '',
        passwordHash,
        cart: { create: {} },
      },
    });
    return this.toPublic(customer);
  }

  async login(dto: LoginCustomerDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const customer = await this.prisma.customer.findFirst({
      where: { OR: [{ phone: normalizePhone(dto.identifier) }, { email: identifier }] },
    });
    if (!customer || !(await bcrypt.compare(dto.password, customer.passwordHash))) {
      throw new UnauthorizedException('Invalid phone/email or password');
    }
    return this.toPublic(customer);
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new UnauthorizedException();
    return this.toPublic(customer);
  }

  private toPublic(customer: { id: string; phone: string; email: string | null; name: string }) {
    return { id: customer.id, phone: customer.phone, email: customer.email, name: customer.name };
  }
}
