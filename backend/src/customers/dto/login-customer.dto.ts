import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginCustomerDto {
  @ApiProperty({ description: 'Phone or email', example: '01712345678' })
  @IsString()
  identifier!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}
