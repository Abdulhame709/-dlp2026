import { SubscriptionTier, UserSubscription } from './billing-types';
import { MockPaymentProvider } from './mock-payment-provider';
import { EventBus } from '@/core/utils/event-bus';

export class SubscriptionService {
  private static userSubscriptions = new Map<string, UserSubscription>();

  static async getSubscription(userId: string): Promise<UserSubscription> {
    const existing = this.userSubscriptions.get(userId);
    if (existing) return existing;

    const defaultSub: UserSubscription = {
      id: `sub-uuid-${Date.now()}`,
      userId,
      planName: 'FREE',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
    };

    this.userSubscriptions.set(userId, defaultSub);
    return defaultSub;
  }

  static async upgradePlan(userId: string, tier: SubscriptionTier): Promise<string> {
    // Generate Stripe checkout session URL in background
    const checkoutUrl = await MockPaymentProvider.createCheckoutSession(userId, tier);

    // Update local state (optimistic upgrade)
    const updatedSub: UserSubscription = {
      id: `sub-uuid-${Date.now()}`,
      userId,
      planName: tier,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
    };

    this.userSubscriptions.set(userId, updatedSub);

    // Broadcast Subscription Change Event to EventBus
    await EventBus.publish('SUBSCRIPTION_CHANGED', {
      userId,
      previousPlan: 'FREE',
      newPlan: tier,
    });

    return checkoutUrl;
  }
}
