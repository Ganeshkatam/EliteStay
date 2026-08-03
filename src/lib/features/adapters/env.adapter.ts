import { FeatureFlag, FeatureAdapter } from '../feature.types';

export class EnvAdapter implements FeatureAdapter {
  public isEnabled(flag: FeatureFlag): boolean {
    const value =
      process.env[`NEXT_PUBLIC_FF_${flag}`] || process.env[`FF_${flag}`];
    return value === 'true' || value === '1';
  }
}
