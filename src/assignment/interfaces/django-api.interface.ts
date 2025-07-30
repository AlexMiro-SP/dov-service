export interface DjangoPreviewResponse {
  affectedCategories: Array<{
    slug: string;
    name: string;
    catType: string;
    categoryType: string;
    locale: string;
    currentSnippets: string[];
  }>;
  totalCount: number;
}

export interface DjangoExecuteResponse {
  success: boolean;
  results: {
    processed: number;
    failed: number;
    errors: Array<{
      categorySlug: string;
      error: string;
    }>;
  };
}

export interface DjangoApiError {
  response?: {
    data?: any;
  };
  message?: string;
}
