import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/server/auth-helpers';
import Link from 'next/link';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

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
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                EliteStay
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Luxury apartment interior"
          fill
        />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
      </div>
    </div>
  );
}
