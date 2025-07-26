import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SnippetUiQueryDto extends PaginationQueryDto {}

export class SnippetUiItemDto {
  id: string;
  title: string;
  locale: string;
  component: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SnippetUiPaginatedDto {
  data: SnippetUiItemDto[];
  total: number;
  page: number;
  limit: number;
}
