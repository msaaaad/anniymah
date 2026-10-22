import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

const SETTINGS_ROW_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.storeSetting.upsert({
      where: { id: SETTINGS_ROW_ID },
      update: {},
      create: { id: SETTINGS_ROW_ID },
    });
  }

  update(dto: UpdateSettingsDto) {
    return this.prisma.storeSetting.upsert({
      where: { id: SETTINGS_ROW_ID },
      update: dto,
      create: { id: SETTINGS_ROW_ID, ...dto },
    });
  }
}
