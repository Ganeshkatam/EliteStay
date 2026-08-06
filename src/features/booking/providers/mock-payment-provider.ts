import { PaymentProvider, PaymentIntent } from './payment-provider';
import { v4 as uuidv4 } from 'uuid';
import { PaymentAuthorizationError } from '@/lib/domain/errors';

export class MockPaymentProvider implements PaymentProvider {
  private intents = new Map<string, PaymentIntent>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async authorize(
    amount: number,
    currency: string,
    referenceId: string
  ): Promise<PaymentIntent> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate failure if amount ends in .99 for testing
    if (amount % 1 === 0.99) {
      throw new PaymentAuthorizationError(
        'Mock provider declined authorization (trigger: .99 amount).'
      );
    }

    const intent: PaymentIntent = {
      id: `pi_mock_${uuidv4()}`,
      status: 'requires_capture',
      amount,
      currency,
    };

    this.intents.set(intent.id, intent);
    return intent;
  }

  async capture(paymentIntentId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const intent = this.intents.get(paymentIntentId);
    if (!intent || intent.status !== 'requires_capture') return false;

    intent.status = 'succeeded';
    return true;
  }

  async cancel(paymentIntentId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const intent = this.intents.get(paymentIntentId);
    if (!intent || intent.status !== 'requires_capture') return false;

    intent.status = 'canceled';
    return true;
  }

  async refund(paymentIntentId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const intent = this.intents.get(paymentIntentId);
    if (!intent || intent.status !== 'succeeded') return false;

    intent.status = 'canceled'; // Mocking refund as canceled for simplicity
    return true;
  }
}
