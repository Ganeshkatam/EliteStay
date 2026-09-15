import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';

export default function UsersLoading() {
  return (
    <ContentPanel>
      <PageCanvas>
        <div className="max-w-6xl mx-auto animate-pulse space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="h-14 w-14 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-50 border border-slate-200/60 p-6 space-y-4"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-200" />
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
