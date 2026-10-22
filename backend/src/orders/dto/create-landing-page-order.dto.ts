import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateLandingPageOrderDto {
  @ApiProperty({ example: 'Karim Ahmed' })
  @IsString()
  @MinLength(1)
  customerName!: string;

  @ApiProperty({ example: '01712345678' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'House 12, Road 5, Dhanmondi, Dhaka' })
  @IsString()
  @MinLength(1)
  address!: string;

  @ApiProperty({ example: 'Special Perfume Combo' })
  @IsString()
  @MinLength(1)
  productName!: string;

  @ApiProperty({ example: 1200 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  quantity!: number;

  @ApiPropertyOptional({ enum: ['inside_dhaka', 'outside_dhaka'] })
  @IsOptional()
  @IsIn(['inside_dhaka', 'outside_dhaka'])
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka';

  @ApiProperty({ example: 60 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  deliveryCharge!: number;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Honeypot — hidden from real customers, must stay empty' })
  @IsOptional()
  @IsString()
  company?: string;
}
