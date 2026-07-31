export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface BillingPlan {
  id: string;
  name: SubscriptionTier;
  priceMonthly: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planName: SubscriptionTier;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';
  startDate: Date;
  endDate: Date;
}
