import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateParameterDto {
  @ApiProperty({ example: 'mainPerformer.nextEvent.numberOfTickets' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Number of tickets', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
