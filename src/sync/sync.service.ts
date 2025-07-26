import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { CategoryTypeResponse } from './dto/external-category-type.dto';
import { upsertCategoryType } from './utils/sync-category-type';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly baseUrl = process.env.BACKEND_API_URL;

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async syncCategoryTypes() {
    const { data } = await firstValueFrom(
      this.http.get<CategoryTypeResponse>(`${this.baseUrl}/internal-seats/dov/category-types`, {
        headers: {
          'X-SECRET': 'dov-super-puper-important-secret-key-for-testing',
        },
      }),
    );

    const externalIds = data.results.map(item => item.id);

    for (const item of data.results) {
      await upsertCategoryType(this.prisma, item);
    }

    await this.prisma.categoryType.updateMany({
      where: {
        externalId: { notIn: externalIds },
      },
      data: {
        isActive: false,
        deleted: true,
      },
    });

    this.logger.log(`Synced ${data.results.length} category types`);
  }
}
