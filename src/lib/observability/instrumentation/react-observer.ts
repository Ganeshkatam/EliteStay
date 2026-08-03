import { instrumentExecution } from './instrumentation';
import { SpanMetadata } from '../types/observability.types';

/**
 * Tracks Next.js Server Component rendering lifecycle and ViewModel composition.
 * Separates data fetching latency from HTML streaming latency.
 */
export async function observeServerComponent<T>(
  componentName: string,
  fn: () => Promise<T> | T,
  tags?: Record<string, string>
): Promise<T> {
  const metadata: SpanMetadata = {
    component: componentName,
    tags,
  };

  return instrumentExecution(`Render.${componentName}`, 'RENDER', fn, metadata);
}

/**
 * Tracks the assembly and composition of UI ViewModels from domain data.
 */
export async function observeViewModel<T>(
  viewModelName: string,
  fn: () => Promise<T> | T,
  tags?: Record<string, string>
): Promise<T> {
  const metadata: SpanMetadata = {
    viewModel: viewModelName,
    tags,
  };

  return instrumentExecution(
    `ViewModel.${viewModelName}`,
    'RENDER',
    fn,
    metadata
  );
}
