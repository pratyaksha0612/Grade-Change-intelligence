export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}
