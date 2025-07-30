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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { PreviewAssignmentDto } from './dto/preview-assignment.dto';
import { BulkAssignmentDto } from './dto/bulk-assignment.dto';
import { AssignmentQueueService } from './assignment-queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtUser } from '../common/interfaces/jwt-user';

@ApiTags('Assignments')
@Controller('assignment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly assignmentQueueService: AssignmentQueueService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Create and execute assignments synchronously (for small batches)' })
  @ApiResponse({
    status: 201,
    description: 'Assignments created and executed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - duplicate assignments or invalid data',
  })
  @ApiResponse({
    status: 404,
    description: 'Snippet not found',
  })
  async create(@Body() bulkAssignmentDto: BulkAssignmentDto, @CurrentUser() user: JwtUser) {
    // For synchronous assignment, we execute immediately via Django API
    // This is suitable for small batches (< 50 categories)

    try {
      // First, create assignments in database so they appear in frontend table
      const createAssignmentDto = {
        snippetId: bulkAssignmentDto.snippetId,
        assignments: bulkAssignmentDto.assignments,
        categoryTypes: bulkAssignmentDto.categoryTypes, // Pass categoryTypes for proper catType determination
        metadata: {
          categoryTypes: bulkAssignmentDto.categoryTypes,
          snippetVariationTypes: bulkAssignmentDto.snippetVariationTypes,
          locale: bulkAssignmentDto.locale,
          executionType: 'sync',
        },
      };

      const savedAssignments = await this.assignmentService.createAssignments(
        createAssignmentDto,
        user.id,
      );
      // Execute assignment directly via Django API
      console.log('🚀 Executing Django API call...');
      const results = await this.assignmentQueueService.executeAssignmentInDjango({
        assignmentId: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...bulkAssignmentDto,
        userId: user.id, // Add userId for foreign key constraint
      });
      console.log('✅ Django API execution completed:', results);

      // Update assignment status to ACTIVE after successful execution
      // Find the created assignments to update their status
      console.log('🔄 Finding and updating assignment statuses to ACTIVE...');
      const createdAssignments = await this.assignmentService.findAll({
        snippetId: bulkAssignmentDto.snippetId,
        status: 'PENDING',
      });

      console.log(`📝 Found ${createdAssignments.data.length} assignments to update`);
      for (const assignment of createdAssignments.data) {
        try {
          console.log(`📝 Updating assignment ${assignment.id} status to ACTIVE`);
          await this.assignmentService.update(assignment.id, { status: 'ACTIVE' }, user.id);
          console.log(`✅ Assignment ${assignment.id} status updated to ACTIVE`);
        } catch (updateError) {
          console.error(
            `❌ Failed to update assignment ${assignment.id}:`,
            updateError instanceof Error ? updateError.message : 'Unknown error',
          );
        }
      }
      console.log('✅ Assignment status updates completed');

      return {
        success: true,
        message: 'Assignment executed successfully',
        results,
        assignments: savedAssignments,
      };
    } catch (error) {
      throw new BadRequestException(
        `Assignment execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

  @Get(':snippetId/detailed-history')
  @ApiOperation({
    summary: 'Get detailed assignment history for a snippet',
    description:
      'Returns comprehensive history with full audit trail, user information, and statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed assignment history with statistics and full audit trail',
  })
  @ApiResponse({
    status: 404,
    description: 'Snippet not found',
  })
  async getDetailedHistory(@Param('snippetId') snippetId: string) {
    return this.assignmentService.getDetailedHistory(snippetId);
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

  @Post('preview')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Preview bulk assignment - shows affected categories' })
  @ApiResponse({
    status: 200,
    description: 'Preview data with affected categories',
  })
  async previewBulkAssignment(@Body() previewData: PreviewAssignmentDto): Promise<any> {
    return this.assignmentQueueService.previewAssignment(previewData);
  }

  @Post('bulk-assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Queue bulk assignment for async processing' })
  @ApiResponse({
    status: 202,
    description: 'Assignment queued for processing',
  })
  async queueBulkAssignment(
    @Body() assignmentData: BulkAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const bulkData = {
      assignmentId,
      ...assignmentData,
      userId: user.id, // Add userId for foreign key constraint
    };

    await this.assignmentQueueService.queueAssignment(bulkData);

    return {
      assignmentId,
      status: 'PENDING',
      message: 'Assignment queued for processing',
    };
  }

  @Get(':assignmentId/status')
  @ApiOperation({ summary: 'Get assignment processing status' })
  @ApiResponse({
    status: 200,
    description: 'Assignment status and progress',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignment not found',
  })
  async getAssignmentStatus(@Param('assignmentId') assignmentId: string) {
    const status = await this.assignmentQueueService.getAssignmentStatus(assignmentId);

    if (!status) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    return status;
  }

  @Post('test-sync')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiOperation({ summary: 'Test synchronous Django-native assignment (for debugging)' })
  @ApiResponse({
    status: 200,
    description: 'Assignment executed synchronously',
  })
  async testSyncAssignment(
    @Body() assignmentData: BulkAssignmentDto,
    @CurrentUser() user: JwtUser,
  ) {
    const testData = {
      assignmentId: `sync_test_${Date.now()}`,
      ...assignmentData,
      userId: user.id, // Add userId for foreign key constraint
    };

    // Execute assignment synchronously (bypass queue)
    const results = await this.assignmentQueueService.executeAssignmentInDjango(testData);

    return {
      success: true,
      message: 'Synchronous assignment completed',
      results,
      testData: {
        assignmentId: testData.assignmentId,
        useNativeLogic: testData.useNativeLogic,
        categoryTypes: testData.categoryTypes,
        snippetVariations: testData.snippetVariations?.length || 0,
      },
    };
  }
}
