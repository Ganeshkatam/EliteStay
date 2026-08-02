import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PublishingService } from '@/features/host/publishing/services/publishing.service';

export default async function BuildIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resumeSection = await PublishingService.getResumeSection(
    supabase,
    id,
    user.id
  );

  redirect(`/host/listings/${id}/build/${resumeSection}`);
}
