import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSnippetDto, ParagraphDto, VariationDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { VariationType } from '@prisma/client';
import { SnippetUiQueryDto, SnippetUiPaginatedDto } from './dto/snippet-ui.dto';

@Injectable()
export class SnippetService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSubSnippets(dto: CreateSnippetDto | UpdateSnippetDto) {
    const result: Array<{
      type: VariationType;
      base: string;
      paragraphs: {
        create: Array<{
          content: string;
          order?: number;
          variations: {
            create: Array<{
              content: string;
              order: number;
            }>;
          };
        }>;
      };
    }> = [];

    const processSubSnippet = (
      subDto: { base: string; paragraphs: ParagraphDto[] } | undefined,
      type: VariationType,
    ) => {
      if (!subDto) return;
      result.push({
        type,
        base: subDto.base,
        paragraphs: {
          create: subDto.paragraphs.map((p: ParagraphDto) => ({
            content: p.content,
            order: p.order,
            variations: {
              create: p.variations.map((v: VariationDto) => ({
                content: v.content,
                order: v.order,
              })),
            },
          })),
        },
      });
    };

    const typedDto = dto as CreateSnippetDto & {
      slim?: { base: string; paragraphs: ParagraphDto[] };
      evergreen?: { base: string; paragraphs: ParagraphDto[] };
      dynamic?: { base: string; paragraphs: ParagraphDto[] };
    };
    processSubSnippet(typedDto.slim, VariationType.SLIM);
    processSubSnippet(typedDto.evergreen, VariationType.EVERGREEN);
    processSubSnippet(typedDto.dynamic, VariationType.DYNAMIC);

    if (result.length === 0) {
      throw new BadRequestException('At least one sub-snippet must be provided');
    }

    return result;
  }

  async create(dto: CreateSnippetDto) {
    return this.prisma.snippet.create({
      data: {
        title: dto.title,
        locale: dto.locale,
        component: dto.component,
        subSnippets: {
          create: this.buildSubSnippets(dto),
        },
      },
      include: {
        subSnippets: {
          include: {
            paragraphs: {
              include: { variations: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.snippet.findUnique({
      where: { id, deletedAt: null },
      include: {
        subSnippets: {
          include: {
            paragraphs: {
              include: { variations: true },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            catType: true,
            slug: true,
            status: true,
            assignedAt: true,
            lastSyncAt: true,
          },
          orderBy: [{ catType: 'asc' }, { slug: 'asc' }],
        },
      },
    });
  }

  async findAll() {
    return this.prisma.snippet.findMany({
      where: { deletedAt: null },
      include: {
        subSnippets: {
          include: {
            paragraphs: {
              include: { variations: true },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            catType: true,
            slug: true,
            status: true,
            assignedAt: true,
            lastSyncAt: true,
          },
          orderBy: [{ catType: 'asc' }, { slug: 'asc' }],
        },
      },
    });
  }

  async update(id: string, dto: UpdateSnippetDto) {
    await this.prisma.subSnippet.deleteMany({ where: { snippetId: id } });

    return this.prisma.snippet.update({
      where: { id },
      data: {
        title: dto.title,
        locale: dto.locale,
        component: dto.component,
        subSnippets: {
          create: this.buildSubSnippets(dto),
        },
      },
      include: {
        subSnippets: {
          include: {
            paragraphs: {
              include: { variations: true },
            },
          },
        },
        assignments: {
          select: {
            id: true,
            catType: true,
            slug: true,
            status: true,
            assignedAt: true,
            lastSyncAt: true,
          },
          orderBy: [{ catType: 'asc' }, { slug: 'asc' }],
        },
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.snippet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getUiList(query: SnippetUiQueryDto): Promise<SnippetUiPaginatedDto> {
    const { page = 1, limit = 20, search } = query;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { locale: { contains: search, mode: 'insensitive' } },
        { component: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.snippet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: {
            select: {
              catType: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.snippet.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  /**
   * Get assignment summary for a snippet (for UI display)
   */
  async getAssignmentSummary(snippetId: string) {
    const assignments = await this.prisma.snippetAssignment.findMany({
      where: { snippetId },
      select: {
        catType: true,
        status: true,
      },
    });

    // Group by catType and count by status
    const summary = assignments.reduce(
      (acc, assignment) => {
        if (!acc[assignment.catType]) {
          acc[assignment.catType] = {
            total: 0,
            active: 0,
            pending: 0,
            failed: 0,
            archived: 0,
          };
        }

        acc[assignment.catType].total++;
        const statusKey = assignment.status.toLowerCase() as
          | 'active'
          | 'pending'
          | 'failed'
          | 'archived';
        if (statusKey in acc[assignment.catType]) {
          const categoryStats = acc[assignment.catType] as Record<string, number>;
          categoryStats[statusKey]++;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          total: number;
          active: number;
          pending: number;
          failed: number;
          archived: number;
        }
      >,
    );

    return {
      summary,
      totalAssignments: assignments.length,
      totalCategories: Object.keys(summary).length,
    };
  }
}
