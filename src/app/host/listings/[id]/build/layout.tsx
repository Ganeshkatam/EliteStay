import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Build Listing - EliteStay',
};

const STEPS = [
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'location', label: 'Location' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'images', label: 'Images' },
  { id: 'review', label: 'Review' },
];

export default async function BuildListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify ownership and fetch progress
  const { data: listing } = await supabase
    .from('listings')
    .select(
      `
      id,
      host_id,
      status,
      listing_build_progress(percent_complete)
    `
    )
    .eq('id', id)
    .single();

  if (!listing || listing.host_id !== user.id) {
    redirect('/host/listings');
  }

  if (listing.status !== 'draft' && listing.status !== 'ready') {
    // If it's already published, they should probably go to a different edit view,
    // but for V1 we'll just let them use the wizard to edit if they want,
    // or maybe redirect them to the standard edit page.
    // For now, allow it.
  }

  const percentComplete =
    listing.listing_build_progress?.[0]?.percent_complete || 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Navbar specifically for builder */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/host/listings"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Exit
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm font-semibold text-slate-900">
            Build Listing
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{percentComplete}% completed</span>
            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
          {/* We'll implement discard later via a client component if needed, or just let them exit */}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Steps */}
        <aside className="hidden w-64 flex-shrink-0 border-r bg-slate-50/50 md:block p-6">
          <nav className="space-y-4">
            {STEPS.map((step, index) => {
              // We could calculate actual completion based on the current step,
              // but for now we'll just use a simple visual approximation or let the user click through.
              // In a real app, we'd highlight the active route. We'll use a Client Component for active state later if needed.
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3 text-slate-500"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Step Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-6 md:p-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
