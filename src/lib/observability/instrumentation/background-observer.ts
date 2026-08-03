import { instrumentExecution } from './instrumentation';
import { SpanMetadata } from '../types/observability.types';

/**
 * Tracks async background tasks, scheduled cron jobs, and queue worker executions.
 * Reuses the core trace tree engine to give background jobs the same visibility as HTTP requests.
 */
export async function observeTask<T>(
  taskName: string,
  fn: () => Promise<T> | T,
  tags?: Record<string, string>
): Promise<T> {
  const metadata: SpanMetadata = {
    jobName: taskName,
    tags,
  };

  return instrumentExecution(`Task.${taskName}`, 'TASK', fn, metadata);
}
