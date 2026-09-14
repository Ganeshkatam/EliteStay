import { type ExtendedProfile } from '@/types/profile';
import {
  ShieldCheck,
  Mail,
  Phone,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationSectionProps {
  profile: ExtendedProfile;
  email: string | undefined;
}

export function VerificationSection({
  profile,
  email,
}: VerificationSectionProps) {
  const items = [
    {
      id: 'email',
      label: 'Email',
      value: email,
      isVerified: true,
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'Phone number',
      value: profile.phone ? `+91 ${profile.phone}` : undefined,
      isVerified: Boolean(profile.phone),
      icon: Phone,
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0"
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'p-2 rounded-full',
                item.isVerified
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-50 text-slate-400'
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">{item.label}</h4>
              <p className="text-sm text-slate-500">
                {item.value || 'Not provided'}
              </p>
            </div>
          </div>

          <div>
            {item.id === 'email' ? (
              <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified
              </span>
            ) : item.value ? (
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Added
              </span>
            ) : (
              <span className="text-sm text-slate-400 flex items-center gap-1.5">
                <CircleDashed className="h-4 w-4" />
                Optional
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
