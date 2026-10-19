import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'your-password' })
  @IsString()
  @MinLength(1)
  password!: string;
}
