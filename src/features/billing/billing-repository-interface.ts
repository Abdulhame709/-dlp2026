import { SubscriptionTier, UserSubscription } from './billing-types';

export interface IBillingRepository {
  getSubscription(userId: string): Promise<UserSubscription | null>;

  saveSubscription(
    userId: string,
    tier: SubscriptionTier,
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED',
    startDate: Date,
    endDate: Date
  ): Promise<UserSubscription>;
}
