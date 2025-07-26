import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubSnippetDto } from './dto/create-sub-snippet.dto';
import { UpdateSubSnippetDto } from './dto/update-sub-snippet.dto';

@Injectable()
export class SubSnippetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubSnippetDto) {
    return this.prisma.subSnippet.create({
      data: {
        type: dto.type,
        base: dto.base,
        order: dto.order,
        snippetId: dto.snippetId,
        paragraphs: {
          create: dto.paragraphs.map(p => ({
            content: p.content,
            order: p.order,
            variations: {
              create: p.variations?.map(v => ({
                content: v.content,
                order: v.order,
              })),
            },
          })),
        },
      },
      include: {
        paragraphs: {
          include: { variations: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.subSnippet.findMany({
      include: {
        paragraphs: {
          include: { variations: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.subSnippet.findUnique({
      where: { id },
      include: {
        paragraphs: {
          include: { variations: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateSubSnippetDto) {
    // Remove old paragraphs (and variations cascadingly)
    await this.prisma.paragraph.deleteMany({
      where: { subSnippetId: id },
    });

    return this.prisma.subSnippet.update({
      where: { id },
      data: {
        type: dto.type,
        base: dto.base,
        order: dto.order,
        paragraphs: {
          create: dto.paragraphs?.map(p => ({
            content: p.content,
            order: p.order,
            variations: {
              create: p.variations?.map(v => ({
                content: v.content,
                order: v.order,
              })),
            },
          })),
        },
      },
      include: {
        paragraphs: {
          include: { variations: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.subSnippet.delete({
      where: { id },
    });
  }
}
