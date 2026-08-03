import { instrumentExecution } from '../instrumentation/instrumentation';

/**
 * Higher-order function wrapper to instrument application domain services without polluting business logic.
 * Automatically times execution, captures memory consumption deltas, and nests spans within the active trace.
 */
export async function observeService<T>(
  serviceName: string,
  methodName: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, unknown>
): Promise<T> {
  return instrumentExecution(`${serviceName}.${methodName}`, 'SERVICE', fn, {
    service: serviceName,
    method: methodName,
    ...metadata,
  });
}

/**
 * TypeScript method decorator for automatic service observation on class methods.
 */
export function ObserveService(serviceName?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const resolvedServiceName =
      serviceName ||
      (target &&
      typeof target === 'object' &&
      'constructor' in target &&
      typeof (target as { constructor: { name: string } }).constructor ===
        'function'
        ? (target as { constructor: { name: string } }).constructor.name
        : 'UnknownService');

    descriptor.value = async function (...args: unknown[]) {
      return observeService(resolvedServiceName, propertyKey, () =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
