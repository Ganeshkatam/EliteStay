import Link from 'next/link';

export const metadata = {
  title: 'Account Suspended - EliteStay',
};

export default function HostSuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl font-bold text-amber-400">!</div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Host Account Suspended
        </h1>
        <p className="mb-4 text-slate-500">
          Your hosting privileges have been temporarily suspended. This may be
          due to a policy violation, pending verification, or an administrative
          review.
        </p>
        <p className="mb-8 text-sm text-slate-400">
          If you believe this is an error, please contact our support team for
          assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Back to Home
          </Link>
          <Link
            href="/users/settings"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
