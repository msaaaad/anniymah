import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateHeroBannerDto {
  @ApiProperty({ example: 'Winter Combo Offer' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Public URL from POST /uploads' })
  @IsUrl()
  imageUrl!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiPropertyOptional({ default: '', example: '/products/winter-combo' })
  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @ApiPropertyOptional({ description: 'Lower shows first', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
