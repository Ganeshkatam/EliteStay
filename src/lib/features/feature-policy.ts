import { FeatureFlag, FeatureAdapter } from './feature.types';
import { EnvAdapter } from './adapters/env.adapter';

export class FeaturePolicy {
  private adapter: FeatureAdapter;

  constructor(adapter: FeatureAdapter = new EnvAdapter()) {
    this.adapter = adapter;
  }

  public async evaluate(
    flag: FeatureFlag,
    context?: Record<string, unknown>
  ): Promise<boolean> {
    return this.adapter.isEnabled(flag, context);
  }

  public evaluateSync(
    flag: FeatureFlag,
    context?: Record<string, unknown>
  ): boolean {
    const result = this.adapter.isEnabled(flag, context);
    if (result instanceof Promise) {
      // Graceful fallback if a provider requires async but gets called synchronously
      console.warn(
        `[FeaturePolicy] Synchronous evaluation called on async adapter for ${flag}. Defaulting to false.`
      );
      return false;
    }
    return result;
  }
}

export const featurePolicy = new FeaturePolicy();
