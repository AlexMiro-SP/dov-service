import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoryType.findMany({
      where: {
        isActive: true,
        deleted: false,
      },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        description: true,
        externalId: true,
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  async findByCode(code: string) {
    return this.prisma.categoryType.findFirst({
      where: {
        code,
        isActive: true,
        deleted: false,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.categoryType.findUnique({
      where: { id },
    });
  }
}
