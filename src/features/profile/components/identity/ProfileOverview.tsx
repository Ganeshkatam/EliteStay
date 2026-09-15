import { type ExtendedProfile } from '@/types/profile';
import { AvatarUploader } from '@/features/auth/components/AvatarUploader';
import { CalendarDays, Briefcase, ShieldCheck, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileOverviewProps {
  profile: ExtendedProfile;
}

const OCCUPATION_LABELS: Record<string, string> = {
  student: 'Student',
  working_professional: 'Working Professional',
  business_owner: 'Business Owner',
  freelancer: 'Freelancer',
  job_seeker: 'Job Seeker',
  retired: 'Retired',
  employed: 'Employed',
  self_employed: 'Self Employed',
  other: 'Professional',
};

const ROLE_LABELS: Record<string, string> = {
  resident: 'Resident',
  host: 'Host',
  guest: 'Guest Member',
  admin: 'Administrator',
};

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const fields = [
    profile.full_name,
    profile.phone,
    profile.avatar_storage_path,
    profile.bio,
    profile.date_of_birth,
    profile.gender,
    profile.occupation,
  ];

  const completedFields = fields.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedFields / fields.length) * 100
  );

  return (
    <div className="flex flex-col gap-6 items-center md:items-start bg-white rounded-2xl border border-slate-200/60 p-6">
      <div className="shrink-0 relative">
        <AvatarUploader
          currentPath={profile.avatar_storage_path}
          fullName={profile.full_name}
        />
      </div>

      <div className="flex-1 min-w-0 w-full pt-1 flex flex-col items-center md:items-start">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2 break-words text-center md:text-left w-full">
          {profile.full_name || 'Anonymous User'}
        </h1>

        {/* Identity & Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {profile.username && (
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              @{profile.username}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/60 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-600" />
            {ROLE_LABELS[profile.role] || 'Member'}
          </span>
          {profile.phone && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          )}
        </div>

        {/* Short Bio / Tagline */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2 w-full mb-3 text-left">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        {/* Quick Highlights / Meta Information */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-5 w-full">
          {profile.occupation && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1 text-slate-700 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {OCCUPATION_LABELS[profile.occupation] || profile.occupation}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1 text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Member since {format(new Date(profile.created_at), 'MMM yyyy')}
            </span>
          </div>
        </div>

        {/* Completion Widget */}
        {completionPercentage < 100 && (
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 max-w-md w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">
                Complete your profile
              </h3>
              <span className="text-sm font-bold text-slate-900">
                {completionPercentage}%
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <ul className="text-sm text-slate-600 space-y-2">
              {!profile.avatar_storage_path && (
                <li>• Upload a profile photo</li>
              )}
              {!profile.full_name && <li>• Add your full name</li>}
              {!profile.phone && <li>• Add verified phone number</li>}
              {!profile.date_of_birth && <li>• Add your date of birth</li>}
              {!profile.gender && <li>• Specify your gender</li>}
              {!profile.occupation && <li>• Add your occupation</li>}
              {!profile.bio && <li>• Write a short bio</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
