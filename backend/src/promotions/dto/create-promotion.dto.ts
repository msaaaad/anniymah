import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Victory Day Sale' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 16, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  discountPercent!: number;

  @ApiProperty({ example: '2026-12-16', description: 'Start date/time (ISO 8601)' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ example: 3, minimum: 1, description: 'How many days the promotion runs for' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  durationDays!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
