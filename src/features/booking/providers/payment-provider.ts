export interface PaymentIntent {
  id: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'requires_capture'
    | 'canceled'
    | 'succeeded';
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  /**
   * Authorize a payment by creating a payment intent.
   * Funds are guaranteed but not captured.
   */
  authorize(
    amount: number,
    currency: string,
    referenceId: string
  ): Promise<PaymentIntent>;

  /**
   * Capture the authorized funds.
   */
  capture(paymentIntentId: string): Promise<boolean>;

  /**
   * Cancel an un-captured authorization.
   */
  cancel(paymentIntentId: string): Promise<boolean>;

  /**
   * Refund a captured payment.
   */
  refund(paymentIntentId: string): Promise<boolean>;
}
