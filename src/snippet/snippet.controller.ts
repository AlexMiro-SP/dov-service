import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, Query } from '@nestjs/common';
import { SnippetService } from './snippet.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ValidateTemplateParametersPipe } from '../common/validate-template-parameters.pipe';
import { SnippetUiQueryDto, SnippetUiPaginatedDto } from './dto/snippet-ui.dto';
import { ApiPaginationQuery } from '../common/decorators/api-pagination-query.decorator';

@ApiTags('Snippets')
@Controller('snippet')
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @Post()
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Create new snippet' })
  @ApiBody({ type: CreateSnippetDto })
  create(@Body() dto: CreateSnippetDto) {
    return this. snippetService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all snippets with sub-snippets and variations',
  })
  findAll() {
    return this.snippetService.findAll();
  }

  @Get('ui')
  @ApiOperation({ summary: 'Get snippets for UI (paginated, filter, search)' })
  @ApiPaginationQuery()
  async getUiList(@Query() query: SnippetUiQueryDto): Promise<SnippetUiPaginatedDto> {
    return this.snippetService.getUiList(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get snippet by id with sub-snippets and variations.',
  })
  findOne(@Param('id') id: string) {
    return this.snippetService.findOne(id);
  }

  @Get(':id/assignments/summary')
  @ApiOperation({
    summary: 'Get assignment summary for a snippet (for UI display)',
  })
  getAssignmentSummary(@Param('id') id: string) {
    return this.snippetService.getAssignmentSummary(id);
  }

  @Patch(':id')
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Update the snippet' })
  @ApiBody({ type: UpdateSnippetDto })
  update(@Param('id') id: string, @Body() dto: UpdateSnippetDto) {
    return this.snippetService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete the snippet' })
  remove(@Param('id') id: string) {
    return this.snippetService.softDelete(id);
  }
}
