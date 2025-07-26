import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { TemplateParameterValidationService } from './template-parameter-validation.service';

@Injectable()
export class ValidateTemplateParametersPipe implements PipeTransform {
  constructor(private readonly validator: TemplateParameterValidationService) {}

  async transform(value: unknown): Promise<unknown> {
    // Recursively find all content fields (Snippet, SubSnippet, Paragraph, Variation)
    const contents = this.collectContents(value);
    let allParams: string[] = [];
    for (const content of contents) {
      allParams = allParams.concat(this.validator.extractParameters(content));
    }
    const uniqueParams = Array.from(new Set(allParams));
    const notFound = await this.validator.validateParameters(uniqueParams);
    if (notFound.length > 0) {
      throw new BadRequestException(`Unknown template parameters: ${notFound.join(', ')}`);
    }
    return value;
  }

  // Recursively collects all content fields from nested structures
  private collectContents(obj: unknown): string[] {
    let contents: string[] = [];
    if (obj && typeof obj === 'object' && obj !== null) {
      const record = obj as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        if (key === 'content' && typeof record[key] === 'string') {
          contents.push(record[key]);
        } else if (Array.isArray(record[key])) {
          for (const item of record[key] as unknown[]) {
            contents = contents.concat(this.collectContents(item));
          }
        } else if (typeof record[key] === 'object' && record[key] !== null) {
          contents = contents.concat(this.collectContents(record[key]));
        }
      }
    }
    return contents;
  }
}
