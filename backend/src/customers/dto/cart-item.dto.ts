import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1, maximum: 20, default: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  quantity!: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  quantity!: number;
}
