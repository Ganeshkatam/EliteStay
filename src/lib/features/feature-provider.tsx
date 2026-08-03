'use client';

import React, { createContext, useContext, useState } from 'react';
import { FeatureFlag } from './feature.types';
import { featurePolicy } from './feature-policy';

type FeatureFlagsState = Record<FeatureFlag, boolean>;

const defaultState: FeatureFlagsState = {
  [FeatureFlag.HOSTING_ENABLED]: featurePolicy.evaluateSync(
    FeatureFlag.HOSTING_ENABLED
  ),
  [FeatureFlag.MESSAGING_ENABLED]: featurePolicy.evaluateSync(
    FeatureFlag.MESSAGING_ENABLED
  ),
  [FeatureFlag.AI_SEARCH_ENABLED]: featurePolicy.evaluateSync(
    FeatureFlag.AI_SEARCH_ENABLED
  ),
  [FeatureFlag.PAYMENTS_ENABLED]: featurePolicy.evaluateSync(
    FeatureFlag.PAYMENTS_ENABLED
  ),
  [FeatureFlag.OBSERVABILITY_ENABLED]: featurePolicy.evaluateSync(
    FeatureFlag.OBSERVABILITY_ENABLED
  ),
};

const FeatureContext = createContext<FeatureFlagsState>(defaultState);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flags] = useState<FeatureFlagsState>(defaultState);

  // Future-proofing for async/remote fetching (e.g. LaunchDarkly/PostHog SDKs)
  // useEffect(() => {
  //   const fetchRemoteFlags = async () => { ... }
  // }, []);

  return (
    <FeatureContext.Provider value={flags}>{children}</FeatureContext.Provider>
  );
};

export const useFeatureFlag = (flag: FeatureFlag) => {
  const context = useContext(FeatureContext);
  return context[flag] ?? false;
};
