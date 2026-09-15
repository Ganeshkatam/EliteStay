export default function InboxLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-8 animate-pulse space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200/60" />
      <div className="h-6 w-40 bg-slate-200 rounded-lg" />
      <div className="space-y-2 max-w-sm w-full">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-4/5 mx-auto bg-slate-100 rounded" />
      </div>
    </div>
  );
}
