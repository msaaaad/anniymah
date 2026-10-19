import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ORDER_STATUSES, type OrderStatusValue } from './update-order-status.dto.js';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: OrderStatusValue;

  @ApiPropertyOptional({ description: 'Matches customer name or phone' })
  @IsOptional()
  @IsString()
  search?: string;
}
