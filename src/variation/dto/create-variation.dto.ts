import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVariationDto {
  @ApiProperty({ example: 'Some variation content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;

  @ApiProperty({ example: 'paragraph-id' })
  @IsString()
  @IsNotEmpty()
  paragraphId: string;
}
