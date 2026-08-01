import { Skeleton } from '@/components/ui/skeleton';

export function ConversationListSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden p-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 border-b border-slate-100">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3.5 w-full max-w-[180px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationHeaderSkeleton() {
  return (
    <div className="h-20 shrink-0 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function MessageTimelineSkeleton() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex w-full justify-start mt-4">
        <Skeleton className="h-16 w-3/4 rounded-2xl rounded-bl-sm" />
      </div>
      <div className="flex w-full justify-end mt-4">
        <Skeleton className="h-12 w-2/3 rounded-2xl rounded-br-sm" />
      </div>
      <div className="flex w-full justify-start mt-4">
        <Skeleton className="h-20 w-3/4 rounded-2xl rounded-bl-sm" />
      </div>
      <div className="flex w-full justify-end mt-4">
        <Skeleton className="h-12 w-1/2 rounded-2xl rounded-br-sm" />
      </div>
    </div>
  );
}

export function MessageComposerSkeleton() {
  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <Skeleton className="h-[48px] flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      </div>
    </div>
  );
}
