import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { SubSnippetService } from './sub-snippet.service';
import { CreateSubSnippetDto } from './dto/create-sub-snippet.dto';
import { UpdateSubSnippetDto } from './dto/update-sub-snippet.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ValidateTemplateParametersPipe } from '../common/validate-template-parameters.pipe';

@ApiTags('SubSnippets')
@Controller('sub-snippet')
export class SubSnippetController {
  constructor(private readonly subSnippetService: SubSnippetService) {}

  @Post()
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Create a new SubSnippet' })
  @ApiBody({ type: CreateSubSnippetDto })
  create(@Body() dto: CreateSubSnippetDto) {
    return this.subSnippetService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all SubSnippets' })
  findAll() {
    return this.subSnippetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SubSnippet by ID' })
  findOne(@Param('id') id: string) {
    return this.subSnippetService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Update SubSnippet by ID' })
  @ApiBody({ type: UpdateSubSnippetDto })
  update(@Param('id') id: string, @Body() dto: UpdateSubSnippetDto) {
    return this.subSnippetService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SubSnippet by ID' })
  remove(@Param('id') id: string) {
    return this.subSnippetService.remove(id);
  }
}
