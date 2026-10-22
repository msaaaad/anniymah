import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled', 'rejected'] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATUSES })
  @IsIn(ORDER_STATUSES)
  status!: OrderStatusValue;
}
