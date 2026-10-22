import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { DEFAULT_THEME_COLORS, THEME_COLOR_DESCRIPTIONS } from '../theme-colors.js';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const HEX_MESSAGE = 'must be a 6 digit hex color such as #C05112';

export class ThemeColorsDto {
  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.bg, description: THEME_COLOR_DESCRIPTIONS.bg })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  bg?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.surface, description: THEME_COLOR_DESCRIPTIONS.surface })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  surface?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.sage, description: THEME_COLOR_DESCRIPTIONS.sage })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  sage?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.sageDark, description: THEME_COLOR_DESCRIPTIONS.sageDark })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  sageDark?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.sageTint, description: THEME_COLOR_DESCRIPTIONS.sageTint })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  sageTint?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.rose, description: THEME_COLOR_DESCRIPTIONS.rose })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  rose?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.roseDark, description: THEME_COLOR_DESCRIPTIONS.roseDark })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  roseDark?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.roseTint, description: THEME_COLOR_DESCRIPTIONS.roseTint })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  roseTint?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.text, description: THEME_COLOR_DESCRIPTIONS.text })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  text?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.muted, description: THEME_COLOR_DESCRIPTIONS.muted })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  muted?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.border, description: THEME_COLOR_DESCRIPTIONS.border })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  border?: string;

  @ApiPropertyOptional({ example: DEFAULT_THEME_COLORS.mediaBg, description: THEME_COLOR_DESCRIPTIONS.mediaBg })
  @IsOptional()
  @Matches(HEX_COLOR, { message: HEX_MESSAGE })
  mediaBg?: string;
}
