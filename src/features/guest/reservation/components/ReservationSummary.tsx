import React from 'react';
import { ReservationViewModel } from '../view-models/reservation.viewmodel';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { MapPin, User, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface ReservationSummaryProps {
  viewModel: ReservationViewModel;
}

export function ReservationSummary({ viewModel }: ReservationSummaryProps) {
  const { listing, stay } = viewModel;

  return (
    <Card className="overflow-hidden mb-6">
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">
                {listing.roomType} in {listing.accommodationType}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm mt-6 mb-6 pb-6 border-b">
          <div>
            <p className="text-gray-500 mb-1">Move-in Date</p>
            <p className="font-medium">
              {stay.moveInDate
                ? format(stay.moveInDate, 'MMM d, yyyy')
                : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Duration</p>
            <p className="font-medium">
              {stay.duration ? `${stay.duration} month(s)` : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Move-out Date</p>
            <p className="font-medium">
              {stay.moveOutDate
                ? format(stay.moveOutDate, 'MMM d, yyyy')
                : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Occupancy</p>
            <p className="font-medium">1 Person</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 text-gray-400 mr-3" />
            <span>
              Hosted by <span className="font-medium">{listing.host.name}</span>
            </span>
          </div>

          <div className="flex items-center text-sm">
            <ShieldCheck className="w-4 h-4 text-gray-400 mr-3" />
            <span>
              Gender Policy:{' '}
              <span className="font-medium capitalize">
                {listing.genderPreference || 'Any'}
              </span>
            </span>
          </div>

          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mr-3" />
            <span>
              Cancellation Policy:{' '}
              <span className="font-medium">{listing.cancellationPolicy}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
