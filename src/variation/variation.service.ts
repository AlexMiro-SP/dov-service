import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariationDto } from './dto/create-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';

@Injectable()
export class VariationService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVariationDto) {
    return this.prisma.variation.create({
      data: {
        content: dto.content,
        order: dto.order,
        paragraphId: dto.paragraphId,
      },
    });
  }

  findAll() {
    return this.prisma.variation.findMany();
  }

  findOne(id: string) {
    return this.prisma.variation.findUnique({
      where: { id },
    });
  }

  update(id: string, dto: UpdateVariationDto) {
    return this.prisma.variation.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.variation.delete({
      where: { id },
    });
  }
}
