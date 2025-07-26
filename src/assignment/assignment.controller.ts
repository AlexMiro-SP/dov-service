import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtUser } from '../common/interfaces/jwt-user';

@ApiTags('Assignments')
@Controller('assignment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create multiple assignments for a snippet' })
  @ApiResponse({
    status: 201,
    description: 'Assignments created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - duplicate assignments or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Snippet not found',
  })
  async create(@Body() createAssignmentDto: CreateAssignmentDto, @CurrentUser() user: JwtUser) {
    return this.assignmentService.createAssignments(createAssignmentDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all assignments with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assignments with pagination info',
  })
  async findAll(@Query() filter: AssignmentFilterDto) {
    return this.assignmentService.findAll(filter);
  }

  @Get('by-snippet/:snippetId')
  @ApiOperation({ summary: 'Get all assignments for a specific snippet' })
  @ApiResponse({
    status: 200,
    description: 'Assignments grouped by catType with history',
  })
  @ApiResponse({
    status: 404,
    description: 'Snippet not found',
  })
  async findBySnippet(@Param('snippetId') snippetId: string) {
    return this.assignmentService.findBySnippet(snippetId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - slug conflict or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.assignmentService.update(id, updateAssignmentDto, user.id);
  }

  @Get('by-snippet/:snippetId')
  @ApiOperation({ summary: 'Get assignments by snippet ID with history' })
  @ApiResponse({
    status: 200,
    description: 'Assignments retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Snippet not found',
  })
  async getBySnippet(@Param('snippetId') snippetId: string) {
    return this.assignmentService.getBySnippet(snippetId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiResponse({
    status: 200,
    description: 'Assignment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found',
  })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.assignmentService.remove(id, user.id);
  }
}
