import { IsEmail, IsOptional, MinLength, IsEnum, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== '') // ← skips validation if empty string
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
