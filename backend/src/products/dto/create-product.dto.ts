import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class CreateProductDto {
  @ApiProperty({ example: 'Signature Perfume Combo' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'signature-perfume-combo' })
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase, numbers and single hyphens only' })
  slug!: string;

  @ApiPropertyOptional({ description: 'Category id, or omit for uncategorized' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 999 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({ description: 'Shown crossed out when higher than price', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  regularPrice?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  freeDelivery?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  deliveryChargeInsideDhaka?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  deliveryChargeOutsideDhaka?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Public URLs from POST /uploads, in display order',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  images?: string[];
}
