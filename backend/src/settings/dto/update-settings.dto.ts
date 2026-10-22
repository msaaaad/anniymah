import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  defaultDeliveryChargeInsideDhaka?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  defaultDeliveryChargeOutsideDhaka?: number;

  @ApiPropertyOptional({ example: '8801712345678' })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Empty string clears it' })
  @ValidateIf((_, value) => value !== undefined && value !== '')
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactAddress?: string;

  @ApiPropertyOptional({ example: 'Free delivery all over Dhaka this week' })
  @IsOptional()
  @IsString()
  announcementText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  announcementActive?: boolean;

  @ApiPropertyOptional({ description: 'Tracked products at or below this stock count as low stock', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;
}
