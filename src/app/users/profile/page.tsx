import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileOverview } from '@/features/profile/components/identity/ProfileOverview';
import { ProfileSection } from '@/features/profile/components/identity/ProfileSection';
import { ProfileField } from '@/features/profile/components/identity/ProfileField';
import { VerificationSection } from '@/features/profile/components/identity/VerificationSection';
import {
  NameForm, DateOfBirthForm, GenderForm, OccupationForm, BioForm,
  PhoneForm, UsernameForm
} from '@/features/profile/components/identity/IdentityForms';
import { ContentPanel } from '@/features/dashboard/components/ContentPanel';
import { PageCanvas } from '@/features/dashboard/components/PageCanvas';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <ContentPanel>
      <PageCanvas>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Overview & Verification */}
            <div className="lg:col-span-4 space-y-8">
              <ProfileOverview profile={profile} />
              
              <div id="verification" className="bg-white rounded-2xl border border-slate-200/60 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">Identity & Verification</h3>
                  <p className="text-sm text-slate-500 mt-1">Your trusted status on EliteStay.</p>
                </div>
                <VerificationSection profile={profile} email={user.email} />
              </div>
            </div>

            {/* Right Column: Forms & Details */}
            <div className="lg:col-span-8 space-y-12">
              <div id="identity">
                <ProfileSection title="Identity" description="Your core identity on EliteStay.">
                  <ProfileField label="Username" value={profile.username ? `@${profile.username}` : ''}>
                    <UsernameForm profile={profile} />
                  </ProfileField>
                  <ProfileField label="Display Name" value={profile.display_name}>
                    <div />
                  </ProfileField>
                  <ProfileField label="Legal Name" value={profile.full_name}>
                    <NameForm profile={profile} />
                  </ProfileField>
                </ProfileSection>
              </div>

              <div id="personal">
                <ProfileSection title="Personal Information" description="A bit more about you.">
                  <ProfileField label="Biography" value={profile.bio}>
                    <BioForm profile={profile} />
                  </ProfileField>
                  <ProfileField label="Date of Birth" value={profile.date_of_birth}>
                    <DateOfBirthForm profile={profile} />
                  </ProfileField>
                  <ProfileField label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}>
                    <GenderForm profile={profile} />
                  </ProfileField>
                </ProfileSection>
              </div>



              <div id="professional">
                <ProfileSection title="Professional" description="What you do.">
                  <ProfileField label="Occupation" value={profile.occupation}>
                    <OccupationForm profile={profile} />
                  </ProfileField>
                </ProfileSection>
              </div>

              <div id="contact">
                <ProfileSection title="Contact Information" description="How we can reach you privately.">
                  <ProfileField label="Email Address" value={user.email} isEditable={false}>
                    <div />
                  </ProfileField>
                  <ProfileField label="Phone Number" value={profile.phone}>
                    <PhoneForm profile={profile} />
                  </ProfileField>
                </ProfileSection>
              </div>
            </div>

          </div>
        </div>
      </PageCanvas>
    </ContentPanel>
  );
}
