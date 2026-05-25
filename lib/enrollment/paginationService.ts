/**
 * PAGINATION SERVICE
 * Handles customer lookup pagination
 */

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationState;
}

export const paginationService = {
  /**
   * Paginate array
   */
  paginate<T>(
    items: T[],
    page: number,
    pageSize: number
  ): PaginatedResult<T> {
    const total = items.length;
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: end < total,
      },
    };
  },

  /**
   * Get page count
   */
  getPageCount: (total: number, pageSize: number): number => {
    return Math.ceil(total / pageSize);
  },

  /**
   * Check if last page
   */
  isLastPage: (page: number, total: number, pageSize: number): boolean => {
    const pageCount = Math.ceil(total / pageSize);
    return page === pageCount - 1;
  },

  /**
   * Get start and end indices
   */
  getRange: (page: number, pageSize: number) => {
    return {
      start: page * pageSize,
      end: (page + 1) * pageSize,
    };
  }
};
