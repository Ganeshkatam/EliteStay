import { GuestService } from '@/features/guest/services/guest.service';
import { ReservationWorkspace } from '@/features/guest/reservation/components/ReservationWorkspace';
import { notFound } from 'next/navigation';

interface ReservationPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function ReservationPage({
  params,
}: ReservationPageProps) {
  const { publicId } = await params;

  // Since Sprint 1 operates entirely client-side without Server Actions,
  // we must pass the raw listing constraints down to the client machine.
  const rawListingData = await GuestService.createReservationIntent(publicId);

  if (!rawListingData) {
    notFound();
  }

  return <ReservationWorkspace initialListingData={rawListingData} />;
}
