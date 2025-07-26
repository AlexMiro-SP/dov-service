import { Controller, Post, Get, Patch, Delete, Param, Body, UsePipes } from '@nestjs/common';
import { VariationService } from './variation.service';
import { CreateVariationDto } from './dto/create-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ValidateTemplateParametersPipe } from '../common/validate-template-parameters.pipe';

@ApiTags('Variations')
@Controller('variation')
export class VariationController {
  constructor(private readonly variationService: VariationService) {}

  @Post()
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Create variation' })
  @ApiBody({ type: CreateVariationDto })
  create(@Body() dto: CreateVariationDto) {
    return this.variationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variations' })
  findAll() {
    return this.variationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a variation by ID' })
  findOne(@Param('id') id: string) {
    return this.variationService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(ValidateTemplateParametersPipe)
  @ApiOperation({ summary: 'Update a variation' })
  @ApiBody({ type: UpdateVariationDto })
  update(@Param('id') id: string, @Body() dto: UpdateVariationDto) {
    return this.variationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a variation' })
  remove(@Param('id') id: string) {
    return this.variationService.remove(id);
  }
}
