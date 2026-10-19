import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto.js';

export class CreateOrderDto {
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

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ enum: ['inside_dhaka', 'outside_dhaka'], description: 'Required only if any item is not free-delivery' })
  @IsOptional()
  @IsIn(['inside_dhaka', 'outside_dhaka'])
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka';

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Honeypot — hidden from real customers, must stay empty' })
  @IsOptional()
  @IsString()
  company?: string;
}
