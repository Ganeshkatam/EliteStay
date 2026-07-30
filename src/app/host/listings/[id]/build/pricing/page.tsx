import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PricingForm } from '@/features/host/components/PricingForm';

export const metadata = {
  title: 'Step 4: Pricing - Build Listing',
};

export default async function PricingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, host_id')
    .eq('id', id)
    .single();

  if (!listing) redirect('/host/listings');

  // Fetch pricing data if it exists
  const { data: pricing } = await supabase
    .from('listing_prices')
    .select('*')
    .eq('listing_id', id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Set your price</h1>
        <p className="text-slate-500 mt-1">You can change this at any time.</p>
      </div>

      <PricingForm
        listingId={id}
        initialData={{
          amount: pricing?.amount || 0,
          billing_period: pricing?.billing_period || 'month',
          security_deposit: pricing?.security_deposit || 0,
          maintenance_fee: pricing?.maintenance_fee || 0,
        }}
      />
    </div>
  );
}
