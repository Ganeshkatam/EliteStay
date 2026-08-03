import { observeSqlQuery } from '../instrumentation/sql-observer';

/**
 * Higher-order function wrapper to instrument repository queries automatically.
 * Ensures persistence methods never need manual logging, timing, or metric updates.
 */
export async function observeRepository<T>(
  repositoryName: string,
  methodName: string,
  queryOrTable: string,
  fn: () => Promise<T>,
  cacheStatus?: 'HIT' | 'MISS' | 'WRITE'
): Promise<T> {
  return observeSqlQuery(
    repositoryName,
    methodName,
    queryOrTable,
    fn,
    cacheStatus
  );
}

/**
 * TypeScript method decorator for automatic repository query observation on class methods.
 */
export function ObserveRepository(tableNameOrQuery = 'table_operation') {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const resolvedRepositoryName =
      target &&
      typeof target === 'object' &&
      'constructor' in target &&
      typeof (target as { constructor: { name: string } }).constructor ===
        'function'
        ? (target as { constructor: { name: string } }).constructor.name
        : 'UnknownRepository';

    descriptor.value = async function (...args: unknown[]) {
      return observeRepository(
        resolvedRepositoryName,
        propertyKey,
        tableNameOrQuery,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
