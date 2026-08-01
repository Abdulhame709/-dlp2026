import { SubscriptionTier } from './billing-types';
import { Logger } from '@/core/logging/logger';

export class MockPaymentProvider {
  /**
   * Simulates generating a Stripe checkout URL session
   */
  static async createCheckoutSession(userId: string, tier: SubscriptionTier): Promise<string> {
    const sessionToken = `mock_stripe_session_${Date.now()}`;
    await Logger.info('Payment Checkout Session Created', { userId, tier, sessionToken });
    return `https://checkout.stripe.mock/pay/${sessionToken}`;
  }

  /**
   * Simulates parsing and verifying Stripe webhook notifications
   */
  static verifyWebhookSignature(signature: string, payload: any): boolean {
    return signature === 'mock-valid-signature';
  }
}
