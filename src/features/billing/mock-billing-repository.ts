import { IBillingRepository } from './billing-repository-interface';
import { SubscriptionTier, UserSubscription } from './billing-types';

// Local in-memory store for development/testing
const mockSubscriptionsStore = new Map<string, UserSubscription>();

export class MockBillingRepository implements IBillingRepository {
  async getSubscription(userId: string): Promise<UserSubscription | null> {
    return mockSubscriptionsStore.get(userId) || null;
  }

  async saveSubscription(
    userId: string,
    tier: SubscriptionTier,
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED',
    startDate: Date,
    endDate: Date
  ): Promise<UserSubscription> {
    const existing = mockSubscriptionsStore.get(userId);

    const sub: UserSubscription = {
      id: existing?.id || `sub-uuid-${Date.now()}`,
      userId,
      planName: tier,
      status,
      startDate,
      endDate,
    };

    mockSubscriptionsStore.set(userId, sub);
    return sub;
  }
}
