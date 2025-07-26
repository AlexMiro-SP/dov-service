import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { AssignmentAction, AssignmentStatus, Prisma } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create multiple assignments for a snippet
   */
  async createAssignments(dto: CreateAssignmentDto, userId: string) {
    // Verify snippet exists
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: dto.snippetId },
    });

    if (!snippet) {
      throw new NotFoundException(`Snippet with ID ${dto.snippetId} not found`);
    }

    // Prepare assignments data
    const assignmentsData: Array<{
      snippetId: string;
      catType: string;
      slug: string;
      status: AssignmentStatus;
      createdBy: string;
    }> = [];
    for (const assignment of dto.assignments) {
      for (const slug of assignment.slugs) {
        assignmentsData.push({
          snippetId: dto.snippetId,
          catType: assignment.catType,
          slug,
          status: 'PENDING' as AssignmentStatus,
          createdBy: userId,
        });
      }
    }

    // Check for duplicates
    const existingAssignments = await this.prisma.snippetAssignment.findMany({
      where: {
        snippetId: dto.snippetId,
        OR: assignmentsData.map(item => ({
          catType: item.catType,
          slug: item.slug,
        })),
      },
    });

    if (existingAssignments.length > 0) {
      const duplicates = existingAssignments.map(a => `${a.catType}/${a.slug}`).join(', ');
      throw new BadRequestException(`Assignments already exist: ${duplicates}`);
    }

    // Create assignments in transaction
    const result = await this.prisma.$transaction(async tx => {
      const createdAssignments = await tx.snippetAssignment.createMany({
        data: assignmentsData,
      });

      // Create history entries
      const assignments = await tx.snippetAssignment.findMany({
        where: {
          snippetId: dto.snippetId,
          catType: { in: dto.assignments.map(a => a.catType) },
        },
      });

      await tx.assignmentHistory.createMany({
        data: assignments.map(assignment => ({
          assignmentId: assignment.id,
          action: 'CREATED' as AssignmentAction,
          userId,
          newValues: {
            catType: assignment.catType,
            slug: assignment.slug,
            status: assignment.status,
          },
          metadata: {
            reason: 'user_action',
            timestamp: new Date().toISOString(),
          },
        })),
      });

      return createdAssignments;
    });

    return result;
  }

  /**
   * Get all assignments with filtering and pagination
   */
  async findAll(filter: AssignmentFilterDto) {
    const { page = 1, limit = 20, ...filters } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.SnippetAssignmentWhereInput = {};
    if (filters.snippetId) where.snippetId = filters.snippetId;
    if (filters.catType) where.catType = filters.catType;
    if (filters.status) where.status = filters.status;

    const [assignments, total] = await Promise.all([
      this.prisma.snippetAssignment.findMany({
        where,
        include: {
          snippet: {
            select: { id: true, title: true, component: true },
          },
          createdUser: {
            select: { id: true, name: true, email: true },
          },
          updatedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.snippetAssignment.count({ where }),
    ]);

    return {
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get assignments for a specific snippet
   */
  async findBySnippet(snippetId: string) {
    const assignments = await this.prisma.snippetAssignment.findMany({
      where: { snippetId },
      include: {
        createdUser: {
          select: { id: true, name: true, email: true },
        },
        updatedUser: {
          select: { id: true, name: true, email: true },
        },
        history: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ catType: 'asc' }, { slug: 'asc' }],
    });

    // Group by catType for better UI display
    const grouped = assignments.reduce(
      (acc, assignment) => {
        if (!acc[assignment.catType]) {
          acc[assignment.catType] = [];
        }
        acc[assignment.catType].push(assignment);
        return acc;
      },
      {} as Record<string, typeof assignments>,
    );

    return {
      assignments,
      grouped,
      summary: {
        total: assignments.length,
        byStatus: assignments.reduce(
          (acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        byCatType: Object.keys(grouped).reduce(
          (acc, catType) => {
            acc[catType] = grouped[catType].length;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    };
  }

  /**
   * Update an assignment
   */
  async update(id: string, dto: UpdateAssignmentDto, userId: string) {
    const assignment = await this.prisma.snippetAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    // Check for slug conflicts if slug is being updated
    if (dto.slug && dto.slug !== assignment.slug) {
      const existing = await this.prisma.snippetAssignment.findUnique({
        where: {
          snippetId_catType_slug: {
            snippetId: assignment.snippetId,
            catType: assignment.catType,
            slug: dto.slug,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Assignment with slug '${dto.slug}' already exists for this catType`,
        );
      }
    }

    // Update in transaction with history
    const result = await this.prisma.$transaction(async tx => {
      const updated = await tx.snippetAssignment.update({
        where: { id },
        data: {
          ...(dto.slug ? { slug: dto.slug } : {}),
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.syncMetadata
            ? {
                syncMetadata: dto.syncMetadata as Prisma.InputJsonValue,
                lastSyncAt: new Date(),
              }
            : {}),
          updatedBy: userId,
        },
        include: {
          snippet: {
            select: { id: true, title: true, component: true },
          },
          createdUser: {
            select: { id: true, name: true, email: true },
          },
          updatedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create history entry
      await tx.assignmentHistory.create({
        data: {
          assignmentId: id,
          action: 'UPDATED' as AssignmentAction,
          userId,
          oldValues: {
            slug: assignment.slug,
            status: assignment.status,
            syncMetadata: assignment.syncMetadata,
          },
          newValues: {
            slug: updated.slug,
            status: updated.status,
            syncMetadata: updated.syncMetadata,
          },
          metadata: {
            reason: 'user_action',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return updated;
    });

    return result;
  }

  /**
   * Delete an assignment
   */
  async remove(id: string, userId: string) {
    const assignment = await this.prisma.snippetAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    // Delete in transaction with history
    await this.prisma.$transaction(async tx => {
      // Create history entry before deletion
      await tx.assignmentHistory.create({
        data: {
          assignmentId: id,
          action: 'DELETED' as AssignmentAction,
          userId,
          oldValues: {
            catType: assignment.catType,
            slug: assignment.slug,
            status: assignment.status,
          },
          metadata: {
            reason: 'user_action',
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Delete assignment (history will be cascade deleted)
      await tx.snippetAssignment.delete({
        where: { id },
      });
    });

    return { message: 'Assignment deleted successfully' };
  }

  /**
   * Get assignments by snippet ID with history
   */
  async getBySnippet(snippetId: string) {
    // Verify snippet exists and get its details
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
      select: {
        id: true,
        title: true,
        component: true,
      },
    });

    if (!snippet) {
      throw new NotFoundException(`Snippet with ID ${snippetId} not found`);
    }

    // Get assignments with history
    const assignments = await this.prisma.snippetAssignment.findMany({
      where: { snippetId },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            userId: true,
            createdAt: true,
            metadata: true,
          },
        },
      },
      orderBy: [{ catType: 'asc' }, { slug: 'asc' }],
    });

    return {
      snippet,
      assignments,
    };
  }
}
