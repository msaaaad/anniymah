import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: '01712345678', description: 'Bangladeshi mobile number' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'shopper@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Karim Ahmed' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
