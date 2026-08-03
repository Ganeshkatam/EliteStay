import React from 'react';
import { ReservationViewModel } from '../view-models/reservation.viewmodel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface PricingBreakdownProps {
  viewModel: ReservationViewModel;
}

export function PricingBreakdown({ viewModel }: PricingBreakdownProps) {
  const pricing = viewModel.pricing;

  if (!pricing) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Price Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Rent x {viewModel.stay.duration} month(s)
          </span>
          <span className="font-medium">₹{pricing.rent.toLocaleString()}</span>
        </div>

        {pricing.deposit > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Security Deposit (Refundable)</span>
            <span className="font-medium">
              ₹{pricing.deposit.toLocaleString()}
            </span>
          </div>
        )}

        {pricing.maintenanceFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Maintenance Fee</span>
            <span className="font-medium">
              ₹{pricing.maintenanceFee.toLocaleString()}
            </span>
          </div>
        )}

        {pricing.platformFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Fee</span>
            <span className="font-medium">
              ₹{pricing.platformFee.toLocaleString()}
            </span>
          </div>
        )}

        <div className="pt-4 border-t flex justify-between font-bold">
          <span>Total Upfront</span>
          <span className="text-lg">
            ₹{pricing.totalUpfront.toLocaleString()}
          </span>
        </div>

        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-xs">
          Quote expires at {format(new Date(pricing.expiresAt), 'h:mm a')}
        </div>
      </CardContent>
    </Card>
  );
}
