import { type ExtendedProfile } from '@/types/profile';
import { ShieldCheck, Mail, Phone, AlertCircle } from 'lucide-react';
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
      isVerified: true, // Assuming email is verified from Auth
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'Phone number',
      value: profile.phone ? `+91 ${profile.phone}` : undefined,
      isVerified: !!profile.phone, // Simplified check
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
                  ? 'bg-green-50 text-green-700'
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
            {item.isVerified ? (
              <span className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Action required
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
