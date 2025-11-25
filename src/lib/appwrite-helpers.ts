// Helper functions to convert Firebase-style operations to Appwrite

import { getDatabases, APPWRITE_DATABASE_ID } from '@/appwrite/config';
import { Query } from 'appwrite';

// Convert Firebase where clause to Appwrite query
export function convertWhereClause(field: string, operator: string, value: any): string {
  switch (operator) {
    case '==':
      return Query.equal(field, value);
    case '!=':
      return Query.notEqual(field, value);
    case '>':
      return Query.greaterThan(field, value);
    case '<':
      return Query.lessThan(field, value);
    case '>=':
      return Query.greaterThanEqual(field, value);
    case '<=':
      return Query.lessThanEqual(field, value);
    case 'array-contains':
      return Query.equal(field, value);
    default:
      return Query.equal(field, value);
  }
}

// Convert Firebase orderBy to Appwrite query
export function convertOrderBy(field: string, direction: 'asc' | 'desc' = 'desc'): string {
  if (direction === 'desc') {
    return Query.orderDesc(field);
  }
  return Query.orderAsc(field);
}

// Convert Firebase limit to Appwrite query
export function convertLimit(limit: number): string {
  return Query.limit(limit);
}

// Server timestamp equivalent for Appwrite
export function serverTimestamp(): string {
  return new Date().toISOString();
}

// Helper to get databases instance
export function getDb() {
  return getDatabases();
}

// Helper to get database ID
export function getDbId() {
  return APPWRITE_DATABASE_ID;
}

