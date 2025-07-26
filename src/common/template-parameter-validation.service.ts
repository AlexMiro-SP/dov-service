import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateParameterValidationService {
  constructor(private readonly prisma: PrismaService) {}

  // Extracts all parameters of the form {{ ... }} from the text
  extractParameters(text: string): string[] {
    const regex = /{{\s*([^}]+)\s*}}/g;
    const params = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      params.push(match[1].trim());
    }
    return params;
  }

  // Validates that all parameters exist in the database
  async validateParameters(params: string[]): Promise<string[]> {
    if (params.length === 0) return [];
    const found = await this.prisma.templateParameter.findMany({
      where: { code: { in: params } },
      select: { code: true },
    });
    const foundCodes = found.map(p => p.code);
    return params.filter(p => !foundCodes.includes(p));
  }
}
