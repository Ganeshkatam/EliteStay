export enum FeatureFlag {
  HOSTING_ENABLED = 'HOSTING_ENABLED',
  MESSAGING_ENABLED = 'MESSAGING_ENABLED',
  AI_SEARCH_ENABLED = 'AI_SEARCH_ENABLED',
  PAYMENTS_ENABLED = 'PAYMENTS_ENABLED',
  OBSERVABILITY_ENABLED = 'OBSERVABILITY_ENABLED',
}

export interface FeatureAdapter {
  isEnabled(
    flag: FeatureFlag,
    context?: Record<string, unknown>
  ): boolean | Promise<boolean>;
}
