import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { CreateParagraphDto } from './dto/create-paragraph.dto';
import { UpdateParagraphDto } from './dto/update-paragraph.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ValidateTemplateParametersPipe } from '../common/validate-template-parameters.pipe';

@ApiTags('Paragraphs')
@Controller('paragraph')
export class ParagraphController {
  constructor(private readonly paragraphService: ParagraphService) {}

  @Post()
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Create a new Paragraph' })
  @ApiBody({ type: CreateParagraphDto })
  create(@Body() dto: CreateParagraphDto) {
    return this.paragraphService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Paragraphs' })
  findAll() {
    return this.paragraphService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Paragraph by ID' })
  findOne(@Param('id') id: string) {
    return this.paragraphService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Update Paragraph by ID' })
  @ApiBody({ type: UpdateParagraphDto })
  update(@Param('id') id: string, @Body() dto: UpdateParagraphDto) {
    return this.paragraphService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Paragraph by ID' })
  remove(@Param('id') id: string) {
    return this.paragraphService.remove(id);
  }
}
