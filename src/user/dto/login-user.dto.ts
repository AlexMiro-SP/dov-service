import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'user@seatpick.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'super-strong-password' })
  @IsNotEmpty()
  password: string;
}
