import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <Mail className="h-6 w-6 text-blue-600" />
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        Verify your email
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        We sent you a verification link. Please check your email to verify your
        account before signing in.
      </p>

      <div className="mt-8">
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
