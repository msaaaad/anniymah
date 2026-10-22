import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonItem = { [key: string]: JsonValue };

export class CreateLandingPageDto {
  @ApiProperty({ example: 'special-combo' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase letters, numbers and hyphens' })
  slug!: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  regularPrice?: number;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Public URL from POST /uploads', default: '' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  collectionEnabled?: boolean;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  collectionTitle?: string;

  @ApiPropertyOptional({ type: [Object], default: [] })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  collectionItems?: JsonItem[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featuresEnabled?: boolean;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  featuresTitle?: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  featuresSubtitle?: string;

  @ApiPropertyOptional({ type: [Object], default: [] })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  features?: JsonItem[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  shippingBarEnabled?: boolean;

  @ApiPropertyOptional({ type: [Object], default: [] })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  shippingBarItems?: JsonItem[];

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
}
