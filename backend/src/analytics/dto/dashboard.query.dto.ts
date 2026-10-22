import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'How many days of sales history to return, ending today', default: 30, minimum: 7, maximum: 90 })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(90)
  @Type(() => Number)
  days?: number = 30;
}
