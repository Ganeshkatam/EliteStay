import Link from 'next/link';

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="w-12 h-12 flex items-center justify-center mb-6">
        <span className="text-4xl">🔔</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-6">You're all caught up</h3>
      
      <div className="text-slate-600 space-y-4 mb-8 text-sm">
        <p>We'll let you know when:</p>
        <ul className="space-y-3 text-left w-max mx-auto">
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            a host replies
          </li>
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            your booking status changes
          </li>
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            someone sends you a message
          </li>
          <li className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            important account activity occurs
          </li>
        </ul>
      </div>

      <div className="w-full h-px bg-slate-100 mb-8" />
      
      <Link 
        href="/" 
        className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
      >
        Explore stays &rarr;
      </Link>
    </div>
  );
}
