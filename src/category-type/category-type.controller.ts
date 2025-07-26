import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryTypeService } from './category-type.service';

@ApiTags('category-type')
@Controller('category-type')
export class CategoryTypeController {
  constructor(private readonly categoryTypeService: CategoryTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active category types' })
  @ApiResponse({
    status: 200,
    description: 'List of active category types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          code: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          externalId: { type: 'number' },
        },
      },
    },
  })
  findAll() {
    return this.categoryTypeService.findAll();
  }
}
