import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto.js';
import { ORDER_STATUSES, type OrderStatusValue } from './update-order-status.dto.js';

export class ListOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  @IsOptional()
  @Transform(({ value }) => (!value || value === 'all' ? undefined : value))
  @IsIn(ORDER_STATUSES)
  status?: OrderStatusValue;

  @ApiPropertyOptional({ description: 'Matches customer name or phone' })
  @IsOptional()
  @IsString()
  search?: string;
}
