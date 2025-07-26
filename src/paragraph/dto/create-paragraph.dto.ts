import { IsNotEmpty, IsString, IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreateVariationNestedDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsInt()
  order: number;
}

export class CreateParagraphDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: [CreateVariationNestedDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationNestedDto)
  variations: CreateVariationNestedDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subSnippetId: string;
}
