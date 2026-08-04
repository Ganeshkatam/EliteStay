import { type ExtendedProfile } from '@/types/profile';
import { AvatarUploader } from '@/features/auth/components/AvatarUploader';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileOverviewProps {
  profile: ExtendedProfile;
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const fields = [
    profile.full_name,
    profile.phone,
    profile.avatar_storage_path,
    profile.bio,
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

      <div className="flex-1 min-w-0 w-full pt-2 flex flex-col items-center md:items-start">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 break-words text-center md:text-left w-full">
          {profile.full_name || 'Anonymous User'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
          </div>
        </div>

        {/* Completion Widget */}
        {completionPercentage < 100 && (
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 max-w-md">
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
              {!profile.phone && <li>• Add a verified phone number</li>}
              {!profile.bio && <li>• Write a short bio</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
