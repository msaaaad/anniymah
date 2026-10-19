import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class CreateCategoryDto {
  @ApiProperty({ example: 'Perfumes' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'perfumes' })
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase, numbers and single hyphens only (e.g. "perfumes")' })
  slug!: string;
}
