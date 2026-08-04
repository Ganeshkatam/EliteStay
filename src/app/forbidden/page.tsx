import Link from 'next/link';

export const metadata = {
  title: 'Access Denied - EliteStay',
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl font-bold text-slate-300">403</div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">
          Access Denied
        </h1>
        <p className="mb-8 text-slate-500">
          You do not have permission to access this page. If you believe this is
          an error, please contact support.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
