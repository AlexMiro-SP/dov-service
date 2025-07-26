import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'alexm@seatpick.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'string' })
  @IsNotEmpty()
  password: string;
}
