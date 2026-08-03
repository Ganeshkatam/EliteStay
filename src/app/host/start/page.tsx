import React from 'react';
import { Metadata } from 'next';
import { MarketingLandingWorkspace } from '@/features/host-marketing';

export const metadata: Metadata = {
  title:
    'Start Hosting on EliteStay | Professional Long-Term Accommodation Platform',
  description:
    'Transform your properties into high-yield residences with guaranteed long-term occupancy, automated payouts, and verified resident screenings.',
};

/**
 * Thin Route for starting hosting operations (/host/start).
 * Strictly adheres to the Thin Route Rule: zero business logic or inline SQL.
 */
export default async function HostStartPage() {
  return <MarketingLandingWorkspace />;
}
