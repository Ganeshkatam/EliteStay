export function calculateBookingTotal(
  monthlyRent: number,
  securityDeposit: number,
  months: number
) {
  if (months < 1) throw new Error('Booking must be at least 1 month');
  
  const totalRent = monthlyRent * months;
  const platformFee = totalRent * 0.05; // 5% fee
  
  return {
    monthlyRent,
    securityDeposit,
    months,
    totalRent,
    platformFee,
    totalAmount: totalRent + securityDeposit + platformFee
  };
}

export function validateMinimumStay(
  startDate: string | Date,
  endDate: string | Date,
  minMonths: number
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Rough month calculation for validation purposes
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = diffDays / 30;
  
  return diffMonths >= minMonths;
}
