import { Card, CardContent } from '@/components/ui/card';

export default function HostDashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 md:p-8 animate-pulse">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-200" />
      </div>

      {/* KPI Snapshot - 4x1 Grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-2">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-8 w-12 rounded bg-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* My Properties List */}
      <section className="space-y-4">
        <div className="h-6 w-36 rounded bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-52 rounded bg-slate-200" />
                  <div className="h-4 w-36 rounded bg-slate-100" />
                </div>
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                  <div className="h-8 w-16 rounded-lg bg-slate-100" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
