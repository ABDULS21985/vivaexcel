export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  total?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: ResponseMeta;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
