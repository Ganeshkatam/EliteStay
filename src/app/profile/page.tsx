import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/features/auth/components/ProfileForm';
import { Container } from '@/components/layout/Container';

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

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Your Profile</h1>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <ProfileForm profile={profile} email={user.email} />
        </div>
      </div>
    </Container>
  );
}
