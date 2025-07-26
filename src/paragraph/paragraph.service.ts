import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParagraphDto } from './dto/create-paragraph.dto';
import { UpdateParagraphDto } from './dto/update-paragraph.dto';

@Injectable()
export class ParagraphService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParagraphDto) {
    return this.prisma.paragraph.create({
      data: {
        content: dto.content,
        order: dto.order,
        subSnippetId: dto.subSnippetId,
        variations: {
          create: dto.variations?.map(v => ({
            content: v.content,
            order: v.order,
          })),
        },
      },
      include: {
        variations: true,
      },
    });
  }

  async findAll() {
    return this.prisma.paragraph.findMany({
      include: {
        variations: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.paragraph.findUnique({
      where: { id },
      include: {
        variations: true,
      },
    });
  }

  async update(id: string, dto: UpdateParagraphDto) {
    // Remove old variations
    await this.prisma.variation.deleteMany({
      where: { paragraphId: id },
    });

    return this.prisma.paragraph.update({
      where: { id },
      data: {
        content: dto.content,
        order: dto.order,
        variations: {
          create: dto.variations?.map(v => ({
            content: v.content,
            order: v.order,
          })),
        },
      },
      include: {
        variations: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.paragraph.delete({
      where: { id },
    });
  }
}
