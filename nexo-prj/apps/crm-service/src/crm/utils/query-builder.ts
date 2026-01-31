/**
 * Query Builder Utility for Dynamic SQL WHERE Clauses
 * Supports text search, exact match, date ranges, numeric ranges, sorting, and pagination
 */

export interface QueryBuilderParams {
  [key: string]: any;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface QueryBuilderResult {
  whereClause: string;
  params: any[];
  orderByClause: string;
  limitClause: string;
  offsetClause: string;
}

export class QueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private paramCount: number = 0;
  private sortBy?: string;
  private sortOrder: string = 'DESC';
  private limit: number = 50;
  private offset: number = 0;

  constructor(searchParams: QueryBuilderParams = {}) {
    // Handle pagination
    const page = parseInt(searchParams.page as any) || 1;
    this.limit = parseInt(searchParams.limit as any) || 50;
    this.offset = (page - 1) * this.limit;

    // Handle sorting
    if (searchParams.sortBy) {
      this.sortBy = searchParams.sortBy;
      this.sortOrder = searchParams.sortOrder?.toUpperCase() || 'DESC';
    }
  }

  /**
   * Add a text search condition (ILIKE)
   */
  addTextSearch(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} ILIKE $${this.paramCount}`);
      this.params.push(`%${value}%`);
    }
    return this;
  }

  /**
   * Add multiple fields text search (OR condition)
   */
  addMultiFieldTextSearch(fields: string[], value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      const searchConditions = fields.map(field => `${field} ILIKE $${this.paramCount}`);
      this.conditions.push(`(${searchConditions.join(' OR ')})`);
      this.params.push(`%${value}%`);
    }
    return this;
  }

  /**
   * Add an exact match condition
   */
  addExactMatch(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} = $${this.paramCount}`);
      this.params.push(value);
    }
    return this;
  }

  /**
   * Add a date range condition (after a date)
   */
  addDateAfter(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} >= $${this.paramCount}`);
      this.params.push(value);
    }
    return this;
  }

  /**
   * Add a date range condition (before a date)
   */
  addDateBefore(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} <= $${this.paramCount}`);
      this.params.push(value);
    }
    return this;
  }

  /**
   * Add a numeric range condition (greater than or equal)
   */
  addNumericMin(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} >= $${this.paramCount}`);
      this.params.push(parseFloat(value));
    }
    return this;
  }

  /**
   * Add a numeric range condition (less than or equal)
   */
  addNumericMax(field: string, value: any): this {
    if (value !== undefined && value !== null && value !== '') {
      this.paramCount++;
      this.conditions.push(`${field} <= $${this.paramCount}`);
      this.params.push(parseFloat(value));
    }
    return this;
  }

  /**
   * Add a custom condition
   */
  addCustomCondition(condition: string, ...values: any[]): this {
    if (values.length > 0) {
      const placeholders = values.map(() => {
        this.paramCount++;
        return `$${this.paramCount}`;
      });
      this.conditions.push(condition.replace(/\?/g, () => placeholders.shift() || ''));
      this.params.push(...values);
    } else {
      this.conditions.push(condition);
    }
    return this;
  }

  /**
   * Build the WHERE clause
   */
  buildWhereClause(): string {
    if (this.conditions.length === 0) {
      return 'WHERE 1=1';
    }
    return `WHERE ${this.conditions.join(' AND ')}`;
  }

  /**
   * Build the ORDER BY clause
   */
  buildOrderByClause(defaultSort: string = 'created_at'): string {
    const sortField = this.sortBy || defaultSort;
    return `ORDER BY ${sortField} ${this.sortOrder}`;
  }

  /**
   * Build LIMIT clause
   */
  buildLimitClause(): string {
    this.paramCount++;
    this.params.push(this.limit);
    return `LIMIT $${this.paramCount}`;
  }

  /**
   * Build OFFSET clause
   */
  buildOffsetClause(): string {
    this.paramCount++;
    this.params.push(this.offset);
    return `OFFSET $${this.paramCount}`;
  }

  /**
   * Get the final query parameters
   */
  getParams(): any[] {
    return this.params;
  }

  /**
   * Get pagination info
   */
  getPaginationInfo() {
    return {
      limit: this.limit,
      offset: this.offset,
      page: Math.floor(this.offset / this.limit) + 1,
    };
  }

  /**
   * Build complete query result
   */
  build(defaultSort: string = 'created_at'): QueryBuilderResult {
    return {
      whereClause: this.buildWhereClause(),
      params: this.getParams(),
      orderByClause: this.buildOrderByClause(defaultSort),
      limitClause: this.buildLimitClause(),
      offsetClause: this.buildOffsetClause(),
    };
  }
}
