import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateParameterDto } from './dto/create-template-parameter.dto';
import { UpdateTemplateParameterDto } from './dto/update-template-parameter.dto';
import { TemplateParameterUiQueryDto } from './dto/template-parameter-ui.dto';
// import { Prisma, QueryMode } from '@prisma/client';

@Injectable()
export class TemplateParameterService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTemplateParameterDto) {
    const uiCode = dto.code ? `{{ ${dto.code} }}` : '';
    return this.prisma.templateParameter.create({ data: { ...dto, uiCode } });
  }

  findAll() {
    return this.prisma.templateParameter.findMany();
  }

  findOne(id: string) {
    return this.prisma.templateParameter.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTemplateParameterDto) {
    const uiCode = dto.code ? `{{ ${dto.code} }}` : '';
    return this.prisma.templateParameter.update({
      where: { id },
      data: { ...dto, uiCode },
    });
  }

  remove(id: string) {
    console.log(id);
    return this.prisma.templateParameter.delete({ where: { id } });
  }

  async getUiList(query: TemplateParameterUiQueryDto): Promise<any> {
    console.log(query);
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    // Filters
    const andFilters: Record<string, unknown>[] = [];
    if (query.code) andFilters.push({ code: { contains: query.code, mode: 'insensitive' } });
    if (query.uiCode)
      andFilters.push({
        uiCode: { contains: query.uiCode, mode: 'insensitive' },
      });
    if (query.label)
      andFilters.push({
        label: { contains: query.label, mode: 'insensitive' },
      });
    if (query.description)
      andFilters.push({
        description: { contains: query.description, mode: 'insensitive' },
      });

    // Search
    let orSearch: Record<string, unknown>[] | undefined = undefined;
    if (query.search) {
      orSearch = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { uiCode: { contains: query.search, mode: 'insensitive' } },
        { label: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const where: Record<string, unknown> = {
      AND: andFilters.length > 0 ? andFilters : undefined,
      OR: orSearch,
    };

    const [rawData, total] = await this.prisma.$transaction([
      this.prisma.templateParameter.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          code: true,
          uiCode: true,
          label: true,
          description: true,
        },
      }),
      this.prisma.templateParameter.count({ where }),
    ]);
    const data = rawData.map(item => ({
      ...item,
      label: item.label ?? '',
      description: item.description ?? '',
    }));
    return {
      data,
      total,
      page,
      limit,
    };
  }
}
