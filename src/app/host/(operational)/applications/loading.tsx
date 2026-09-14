import { Card } from '@/components/ui/card';

export default function HostApplicationsLoading() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-slate-200" />
        <div className="h-4 w-80 rounded bg-slate-100" />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white gap-4">
              <div className="grid sm:grid-cols-3 gap-4 flex-1">
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-5 w-40 rounded bg-slate-200" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded bg-slate-200" />
                  <div className="h-6 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
