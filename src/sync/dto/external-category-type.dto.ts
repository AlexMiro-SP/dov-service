export interface ExternalCategoryType {
  id: number;
  code: string;
  name: string;
  slug: string;
}

export interface CategoryTypeResponse {
  results: ExternalCategoryType[];
}
