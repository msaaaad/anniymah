import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { DEFAULT_THEME_COLORS, THEME_COLOR_DESCRIPTIONS, THEME_COLOR_KEYS, ThemeColors } from './theme-colors.js';

const SETTINGS_ROW_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const row = await this.prisma.storeSetting.upsert({
      where: { id: SETTINGS_ROW_ID },
      update: {},
      create: { id: SETTINGS_ROW_ID },
    });
    return this.withResolvedTheme(row);
  }

  async update(dto: UpdateSettingsDto) {
    const { themeColors, ...rest } = dto;
    const current = await this.get();
    const mergedTheme = themeColors ? { ...current.themeColors, ...this.definedColors(themeColors) } : undefined;

    const row = await this.prisma.storeSetting.upsert({
      where: { id: SETTINGS_ROW_ID },
      update: { ...rest, ...(mergedTheme && { themeColors: mergedTheme }) },
      create: { id: SETTINGS_ROW_ID, ...rest, ...(mergedTheme && { themeColors: mergedTheme }) },
    });
    return this.withResolvedTheme(row);
  }

  async resetTheme() {
    await this.get();
    const row = await this.prisma.storeSetting.update({
      where: { id: SETTINGS_ROW_ID },
      data: { themeColors: {} },
    });
    return this.withResolvedTheme(row);
  }

  themeDefaults() {
    return THEME_COLOR_KEYS.map((key) => ({
      key,
      defaultColor: DEFAULT_THEME_COLORS[key],
      usage: THEME_COLOR_DESCRIPTIONS[key],
    }));
  }

  private withResolvedTheme<T extends { themeColors: unknown }>(row: T): Omit<T, 'themeColors'> & { themeColors: ThemeColors } {
    const stored = (row.themeColors ?? {}) as Partial<ThemeColors>;
    return { ...row, themeColors: { ...DEFAULT_THEME_COLORS, ...stored } };
  }

  private definedColors(colors: Partial<ThemeColors>) {
    return Object.fromEntries(Object.entries(colors).filter(([, value]) => value !== undefined));
  }
}
