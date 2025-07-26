import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TemplateParameterService } from './template-parameter.service';
import { CreateTemplateParameterDto } from './dto/create-template-parameter.dto';
import { UpdateTemplateParameterDto } from './dto/update-template-parameter.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  TemplateParameterUiPaginatedDto,
  TemplateParameterUiQueryDto,
} from './dto/template-parameter-ui.dto';
import { ApiPaginationQuery } from '../common/decorators/api-pagination-query.decorator';

@ApiTags('Template Parameters')
@Controller('template-parameter')
export class TemplateParameterController {
  constructor(private readonly service: TemplateParameterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template parameter' })
  @ApiBody({
    type: CreateTemplateParameterDto,
    examples: {
      default: {
        value: {
          code: 'mainPerformer.nextEvent.numberOfTickets',
          label: 'Number of tickets',
          description: 'string',
        },
      },
    },
  })
  create(@Body() dto: CreateTemplateParameterDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all template parameters' })
  findAll(): Promise<any> {
    return this.service.findAll();
  }

  @Get('ui')
  @ApiOperation({
    summary: 'Get template parameters for UI (paginated, filter, search)',
  })
  @ApiPaginationQuery()
  async getUiList(
    @Query() query: TemplateParameterUiQueryDto,
  ): Promise<TemplateParameterUiPaginatedDto> {
    return this.service.getUiList(query) as Promise<TemplateParameterUiPaginatedDto>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template parameter by ID' })
  findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template parameter by ID' })
  @ApiBody({
    type: UpdateTemplateParameterDto,
    examples: {
      default: {
        value: {
          code: 'mainPerformer.nextEvent.numberOfTickets',
          label: 'Number of tickets',
          description: 'string',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateParameterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template parameter by ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
