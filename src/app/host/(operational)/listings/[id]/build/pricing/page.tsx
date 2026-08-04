import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PricingForm } from '@/features/host/publishing/components/PricingForm';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export const metadata = {
  title: 'Pricing - Publishing Workspace',
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const data = await PublishingService.getPricingSection(supabase, id, user.id);

  if (!data) redirect('/host/listings');

  const { pricing } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Set your price</h1>
        <p className="text-slate-500 mt-1">
          You can adjust pricing at any time.
        </p>
      </div>

      <PricingForm listingId={id} initialData={pricing} />
    </div>
  );
}
