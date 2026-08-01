import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import Link from 'next/link';
import { AuthInfoPanel } from '@/features/auth/components/AuthInfoPanel';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:h-[100dvh] lg:overflow-hidden">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Form Column (45%) */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-[45%] lg:flex-none lg:px-20 xl:px-24 overflow-y-auto">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {children}
          </div>
        </div>

        {/* Information Panel Column (55%) */}
        <div className="hidden lg:flex lg:w-[55%] bg-slate-900 flex-col justify-center text-white relative overflow-hidden">
          {/* Subtle architectural accents / patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-900 to-slate-900" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 w-full h-full p-12 lg:p-24 flex flex-col justify-center">
            <AuthInfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
