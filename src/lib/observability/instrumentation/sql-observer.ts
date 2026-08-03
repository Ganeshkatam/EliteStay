import { instrumentExecution } from './instrumentation';
import { RequestContext } from '../context/request-context';
import { dbQueryCounter } from '../metrics/counters';
import { dbLatencyHistogram } from '../metrics/histograms';

/**
 * Dedicated observer for persistence and database SQL queries.
 * Records query execution duration, row counts, cache hit status, and analyzes statement syntax for missing WHERE clauses.
 */
export async function observeSqlQuery<T>(
  repositoryName: string,
  operationName: string,
  queryOrTable: string,
  executeFn: () => Promise<T>,
  cacheStatus?: 'HIT' | 'MISS' | 'WRITE'
): Promise<T> {
  const spanName = `${repositoryName}.${operationName}`;
  const isSql =
    queryOrTable.trim().toUpperCase().startsWith('SELECT') ||
    queryOrTable.trim().toUpperCase().startsWith('INSERT') ||
    queryOrTable.trim().toUpperCase().startsWith('UPDATE') ||
    queryOrTable.trim().toUpperCase().startsWith('DELETE') ||
    queryOrTable.trim().toUpperCase().startsWith('RPC');

  const metadata: Record<string, unknown> = {
    repository: repositoryName,
    cacheStatus: cacheStatus ?? 'MISS',
  };

  if (isSql) {
    metadata.sql = queryOrTable;
  } else {
    metadata.table = queryOrTable;
  }

  dbQueryCounter.inc();
  const startTime = Date.now();

  try {
    return await instrumentExecution(
      spanName,
      'DATABASE',
      async () => {
        const result = await executeFn();
        const durationMs = Date.now() - startTime;
        dbLatencyHistogram.observe(durationMs);

        const activeSpan = RequestContext.getActiveSpan();
        if (activeSpan) {
          // Automatically deduct row count from Array results or standard Supabase { data } envelopes
          let rowCount: number | undefined;
          if (Array.isArray(result)) {
            rowCount = result.length;
          } else if (
            result &&
            typeof result === 'object' &&
            'data' in result &&
            Array.isArray((result as { data: unknown[] }).data)
          ) {
            rowCount = (result as { data: unknown[] }).data.length;
          }

          if (rowCount !== undefined) {
            activeSpan.setAttribute('rows', rowCount);
            metadata.rows = rowCount;
          }

          // Check for risky sequential scan patterns in SQL queries
          if (isSql) {
            const upperSql = queryOrTable.toUpperCase();
            if (
              upperSql.includes('SELECT *') &&
              !upperSql.includes('WHERE') &&
              !upperSql.includes('LIMIT')
            ) {
              activeSpan.addWarning(
                'Sequential Scan Warning: Unbounded SELECT * executed without WHERE clause or LIMIT'
              );
            }
          }
        }

        return result;
      },
      metadata
    );
  } catch (error) {
    throw error;
  }
}
