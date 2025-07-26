import { Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({ summary: 'Sync all category reference tables' })
  syncAll() {
    return this.syncService.syncCategoryTypes();
  }
}
