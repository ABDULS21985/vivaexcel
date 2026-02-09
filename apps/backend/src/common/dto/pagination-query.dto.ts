import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Sort order enum
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Base pagination query DTO with common fields
 */
export abstract class BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Sort field must be a valid field name',
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be asc or desc' })
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Cursor-based pagination query DTO
 *
 * Used for infinite scroll or load more patterns.
 * More efficient for large datasets than offset pagination.
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Query() query: CursorPaginationQueryDto) {
 *   return this.service.findAll(query);
 * }
 * ```
 */
export class CursorPaginationQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Cursor for pagination (base64 encoded)',
    example: 'eyJpZCI6IjEyMyIsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDEifQ==',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Direction of pagination relative to cursor',
    enum: ['after', 'before'],
    default: 'after',
    example: 'after',
  })
  @IsOptional()
  @IsEnum(['after', 'before'], {
    message: 'Direction must be after or before',
  })
  direction?: 'after' | 'before' = 'after';
}

/**
 * Offset-based pagination query DTO
 *
 * Used for traditional page-based navigation.
 * Provides total count and page numbers.
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Query() query: OffsetPaginationQueryDto) {
 *   return this.service.findAll(query);
 * }
 * ```
 */
export class OffsetPaginationQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  /**
   * Calculates the offset for database queries
   * @returns The number of items to skip
   */
  getOffset(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 20);
  }
}

/**
 * Type alias for default pagination (cursor-based)
 */
export type PaginationQueryDto = CursorPaginationQueryDto;

/**
 * Helper to create TypeORM-compatible sort object
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (asc/desc)
 * @returns TypeORM order object
 */
export function createSortObject(
  sortBy: string = 'createdAt',
  sortOrder: SortOrder = SortOrder.DESC,
): Record<string, 'ASC' | 'DESC'> {
  return {
    [sortBy]: sortOrder.toUpperCase() as 'ASC' | 'DESC',
  };
}

/**
 * Helper to create search condition for TypeORM
 * @param search - Search query
 * @param fields - Fields to search in
 * @returns TypeORM where condition array
 */
export function createSearchConditions(
  search: string | undefined,
  fields: string[],
): Array<Record<string, { $ilike: string }>> | undefined {
  if (!search || fields.length === 0) {
    return undefined;
  }

  const searchPattern = `%${search}%`;
  return fields.map((field) => ({
    [field]: { $ilike: searchPattern },
  }));
}
