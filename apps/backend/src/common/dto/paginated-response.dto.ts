import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto, ResponseMeta, ResponseStatus } from './base-response.dto';

/**
 * Cursor-based pagination information
 */
export class CursorPaginationMeta {
  @ApiPropertyOptional({
    description: 'Cursor for the next page',
    example: 'eyJpZCI6IjEyMyIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==',
  })
  nextCursor?: string | null;

  @ApiPropertyOptional({
    description: 'Cursor for the previous page',
    example: 'eyJpZCI6IjEyMiIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==',
  })
  previousCursor?: string | null;

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore!: boolean;

  @ApiProperty({
    description: 'Number of items in current page',
    example: 20,
  })
  count!: number;

  @ApiPropertyOptional({
    description: 'Total count of items (if available)',
    example: 150,
  })
  totalCount?: number;

  constructor(partial?: Partial<CursorPaginationMeta>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

/**
 * Offset-based pagination information
 */
export class OffsetPaginationMeta {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  totalCount!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage!: boolean;

  constructor(partial?: Partial<OffsetPaginationMeta>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Creates pagination meta from total count and query params
   * @param totalCount - Total number of items
   * @param page - Current page number
   * @param limit - Items per page
   * @returns OffsetPaginationMeta instance
   */
  static create(
    totalCount: number,
    page: number,
    limit: number,
  ): OffsetPaginationMeta {
    const totalPages = Math.ceil(totalCount / limit);
    return new OffsetPaginationMeta({
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }
}

/**
 * Extended response meta with pagination
 */
export interface PaginatedResponseMeta extends ResponseMeta {
  pagination: CursorPaginationMeta | OffsetPaginationMeta;
}

/**
 * Cursor-based paginated response DTO
 *
 * @example
 * ```typescript
 * {
 *   status: 'success',
 *   message: 'Users retrieved successfully',
 *   data: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }],
 *   meta: {
 *     timestamp: '2024-01-01T00:00:00Z',
 *     pagination: {
 *       nextCursor: 'abc123',
 *       previousCursor: null,
 *       hasMore: true,
 *       count: 20,
 *       totalCount: 150
 *     }
 *   }
 * }
 * ```
 *
 * @template T - Type of items in the data array
 */
export class CursorPaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
    type: () => CursorPaginationMeta,
  })
  declare meta: PaginatedResponseMeta & { pagination: CursorPaginationMeta };

  /**
   * Creates a cursor-paginated success response
   * @param items - Array of items
   * @param paginationMeta - Cursor pagination metadata
   * @param message - Success message
   * @param additionalMeta - Additional metadata
   * @returns CursorPaginatedResponseDto instance
   */
  static paginated<T>(
    items: T[],
    paginationMeta: CursorPaginationMeta,
    message: string = 'Items retrieved successfully',
    additionalMeta?: Omit<ResponseMeta, 'pagination'>,
  ): CursorPaginatedResponseDto<T> {
    const response = new CursorPaginatedResponseDto<T>();
    response.status = ResponseStatus.SUCCESS;
    response.message = message;
    response.data = items;
    response.meta = {
      timestamp: new Date().toISOString(),
      ...additionalMeta,
      pagination: paginationMeta,
    };
    return response;
  }

  /**
   * Creates a cursor-paginated response from query results
   * @param items - Array of items (includes one extra item to check for more)
   * @param limit - Requested limit
   * @param cursorField - Field used for cursor
   * @param encodeCursor - Function to encode cursor value
   * @param message - Success message
   * @returns CursorPaginatedResponseDto instance
   */
  static fromQueryResults<T extends Record<string, unknown>>(
    items: T[],
    limit: number,
    cursorField: keyof T = 'id' as keyof T,
    encodeCursor: (item: T) => string = (item) =>
      Buffer.from(JSON.stringify({ id: item[cursorField] })).toString('base64'),
    message: string = 'Items retrieved successfully',
  ): CursorPaginatedResponseDto<T> {
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    const nextCursor =
      hasMore && resultItems.length > 0
        ? encodeCursor(resultItems[resultItems.length - 1])
        : null;

    return CursorPaginatedResponseDto.paginated<T>(
      resultItems,
      new CursorPaginationMeta({
        nextCursor,
        previousCursor: null,
        hasMore,
        count: resultItems.length,
      }),
      message,
    );
  }
}

/**
 * Offset-based paginated response DTO
 *
 * @example
 * ```typescript
 * {
 *   status: 'success',
 *   message: 'Users retrieved successfully',
 *   data: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }],
 *   meta: {
 *     timestamp: '2024-01-01T00:00:00Z',
 *     pagination: {
 *       page: 1,
 *       limit: 20,
 *       totalCount: 150,
 *       totalPages: 8,
 *       hasNextPage: true,
 *       hasPreviousPage: false
 *     }
 *   }
 * }
 * ```
 *
 * @template T - Type of items in the data array
 */
export class OffsetPaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ApiProperty({
    description: 'Pagination metadata',
    type: () => OffsetPaginationMeta,
  })
  declare meta: PaginatedResponseMeta & { pagination: OffsetPaginationMeta };

  /**
   * Creates an offset-paginated success response
   * @param items - Array of items
   * @param totalCount - Total number of items
   * @param page - Current page number
   * @param limit - Items per page
   * @param message - Success message
   * @param additionalMeta - Additional metadata
   * @returns OffsetPaginatedResponseDto instance
   */
  static paginated<T>(
    items: T[],
    totalCount: number,
    page: number,
    limit: number,
    message: string = 'Items retrieved successfully',
    additionalMeta?: Omit<ResponseMeta, 'pagination'>,
  ): OffsetPaginatedResponseDto<T> {
    const response = new OffsetPaginatedResponseDto<T>();
    response.status = ResponseStatus.SUCCESS;
    response.message = message;
    response.data = items;
    response.meta = {
      timestamp: new Date().toISOString(),
      ...additionalMeta,
      pagination: OffsetPaginationMeta.create(totalCount, page, limit),
    };
    return response;
  }
}

/**
 * Type alias for backward compatibility
 */
export type PaginatedResponseDto<T> = CursorPaginatedResponseDto<T>;
