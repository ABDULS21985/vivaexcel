/**
 * Cursor payload interface
 */
export interface CursorPayload {
  /** Primary key value */
  id: string;
  /** Timestamp or sortable value */
  sortValue?: string | number | Date;
  /** Additional cursor data */
  [key: string]: unknown;
}

/**
 * Decoded cursor result
 */
export interface DecodedCursor {
  /** Whether the cursor is valid */
  valid: boolean;
  /** Cursor payload (if valid) */
  payload?: CursorPayload;
  /** Error message (if invalid) */
  error?: string;
}

/**
 * Cursor utility class for base64 cursor encoding/decoding.
 *
 * Features:
 * - Base64 URL-safe encoding
 * - JSON payload support
 * - Validation and error handling
 * - Type-safe payload extraction
 *
 * Cursor-based pagination is preferred over offset pagination for:
 * - Better performance with large datasets
 * - Consistent results when data changes
 * - Infinite scroll implementations
 *
 * @example
 * // Basic usage
 * ```typescript
 * // Encode a cursor
 * const cursor = CursorUtil.encode({ id: '123', sortValue: '2024-01-01' });
 * // Result: "eyJpZCI6IjEyMyIsInNvcnRWYWx1ZSI6IjIwMjQtMDEtMDEifQ"
 *
 * // Decode a cursor
 * const { valid, payload } = CursorUtil.decode(cursor);
 * if (valid) {
 *   console.log(payload.id); // "123"
 * }
 * ```
 *
 * @example
 * // In a service
 * ```typescript
 * async findAll(query: CursorPaginationQueryDto) {
 *   const where: FindOptionsWhere<Entity> = {};
 *
 *   if (query.cursor) {
 *     const { valid, payload } = CursorUtil.decode(query.cursor);
 *     if (valid && payload) {
 *       where.createdAt = LessThan(new Date(payload.sortValue as string));
 *     }
 *   }
 *
 *   const items = await this.repo.find({
 *     where,
 *     take: query.limit + 1, // Fetch one extra to check for more
 *     order: { createdAt: 'DESC' },
 *   });
 *
 *   const hasMore = items.length > query.limit;
 *   const results = hasMore ? items.slice(0, -1) : items;
 *
 *   return {
 *     items: results,
 *     nextCursor: hasMore
 *       ? CursorUtil.encode({
 *           id: results[results.length - 1].id,
 *           sortValue: results[results.length - 1].createdAt.toISOString(),
 *         })
 *       : null,
 *     hasMore,
 *   };
 * }
 * ```
 */
export class CursorUtil {
  /**
   * Encodes a cursor payload to a base64 URL-safe string
   * @param payload - Cursor payload to encode
   * @returns Base64 URL-safe encoded string
   */
  static encode(payload: CursorPayload): string {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    // Make URL-safe: replace + with -, / with _, remove =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Decodes a base64 URL-safe cursor string
   * @param cursor - Cursor string to decode
   * @returns Decoded cursor result with validity flag
   */
  static decode(cursor: string): DecodedCursor {
    if (!cursor || typeof cursor !== 'string') {
      return { valid: false, error: 'Cursor is required' };
    }

    try {
      // Restore standard base64: replace - with +, _ with /, add padding
      let base64 = cursor.replace(/-/g, '+').replace(/_/g, '/');
      const padding = 4 - (base64.length % 4);
      if (padding !== 4) {
        base64 += '='.repeat(padding);
      }

      const json = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(json) as CursorPayload;

      // Validate payload has required id field
      if (!payload.id) {
        return { valid: false, error: 'Cursor payload missing id' };
      }

      return { valid: true, payload };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid cursor format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Safely decodes a cursor, returning null if invalid
   * @param cursor - Cursor string to decode
   * @returns Cursor payload or null
   */
  static safeDecode(cursor: string | undefined): CursorPayload | null {
    if (!cursor) return null;
    const result = this.decode(cursor);
    return result.valid ? result.payload! : null;
  }

  /**
   * Validates a cursor string
   * @param cursor - Cursor string to validate
   * @returns True if cursor is valid
   */
  static isValid(cursor: string): boolean {
    return this.decode(cursor).valid;
  }

  /**
   * Creates a cursor from an entity
   * @param entity - Entity to create cursor from
   * @param sortField - Field used for sorting (default: 'createdAt')
   * @returns Encoded cursor string
   */
  static fromEntity<T extends { id: string; [key: string]: unknown }>(
    entity: T,
    sortField: keyof T = 'createdAt' as keyof T,
  ): string {
    const payload: CursorPayload = {
      id: entity.id,
    };

    const sortValue = entity[sortField];
    if (sortValue !== undefined) {
      if (sortValue instanceof Date) {
        payload.sortValue = sortValue.toISOString();
      } else if (typeof sortValue === 'string' || typeof sortValue === 'number') {
        payload.sortValue = sortValue;
      }
    }

    return this.encode(payload);
  }

  /**
   * Creates a cursor from the last item in an array
   * @param items - Array of entities
   * @param sortField - Field used for sorting
   * @returns Encoded cursor string or null if array is empty
   */
  static fromLastItem<T extends { id: string; [key: string]: unknown }>(
    items: T[],
    sortField: keyof T = 'createdAt' as keyof T,
  ): string | null {
    if (items.length === 0) return null;
    return this.fromEntity(items[items.length - 1], sortField);
  }

  /**
   * Extracts the ID from a cursor
   * @param cursor - Cursor string
   * @returns ID or null if cursor is invalid
   */
  static getId(cursor: string): string | null {
    const result = this.decode(cursor);
    return result.valid ? result.payload!.id : null;
  }

  /**
   * Extracts the sort value from a cursor
   * @param cursor - Cursor string
   * @returns Sort value or null if cursor is invalid
   */
  static getSortValue(cursor: string): string | number | Date | null {
    const result = this.decode(cursor);
    if (!result.valid || !result.payload!.sortValue) return null;
    return result.payload!.sortValue;
  }

  /**
   * Extracts the sort value as a Date
   * @param cursor - Cursor string
   * @returns Date or null if cursor is invalid or sort value is not a date
   */
  static getSortValueAsDate(cursor: string): Date | null {
    const sortValue = this.getSortValue(cursor);
    if (!sortValue) return null;

    if (sortValue instanceof Date) return sortValue;
    if (typeof sortValue === 'string') {
      const date = new Date(sortValue);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
}

/**
 * Convenience function to encode a cursor
 * @param payload - Cursor payload to encode
 * @returns Base64 URL-safe encoded string
 */
export function encodeCursor(payload: CursorPayload): string {
  return CursorUtil.encode(payload);
}

/**
 * Convenience function to decode a cursor
 * @param cursor - Cursor string to decode
 * @returns Decoded cursor result
 */
export function decodeCursor(cursor: string): DecodedCursor {
  return CursorUtil.decode(cursor);
}

/**
 * Convenience function to safely decode a cursor
 * @param cursor - Cursor string to decode
 * @returns Cursor payload or null
 */
export function safeDecodeCursor(cursor: string | undefined): CursorPayload | null {
  return CursorUtil.safeDecode(cursor);
}

/**
 * Convenience function to create a cursor from the last item
 * @param items - Array of entities
 * @param sortField - Field used for sorting
 * @returns Encoded cursor string or null
 */
export function cursorFromLastItem<T extends { id: string; [key: string]: unknown }>(
  items: T[],
  sortField: keyof T = 'createdAt' as keyof T,
): string | null {
  return CursorUtil.fromLastItem(items, sortField);
}
