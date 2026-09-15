import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HostComplianceService } from '@/features/hosting/services/host-compliance.service';
import { ComplianceCenterView } from '@/features/hosting/components/ComplianceCenterView';

export const metadata: Metadata = {
  title: 'Host Compliance Center - EliteStay',
  description:
    'Manage host KYC identity verification, payout account, and tax registration.',
};

export default async function HostCompliancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const complianceService = new HostComplianceService();
  const summary = await complianceService.getComplianceSummary(user.id);

  return <ComplianceCenterView summary={summary} />;
}
