import { IBillingRepository } from './billing-repository-interface';
import { SubscriptionTier, UserSubscription } from './billing-types';
import { MockPaymentProvider } from './mock-payment-provider';
import { DependencyInjector } from '@/core/config/dependency-injector';
import { EventBus } from '@/core/utils/event-bus';

export class SubscriptionService {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): IBillingRepository {
    return DependencyInjector.getBillingRepository();
  }

  static async getSubscription(userId: string): Promise<UserSubscription> {
    const existing = await this.repository.getSubscription(userId);
    if (existing) return existing;

    // Default subscription for new users
    const defaultSub = await this.repository.saveSubscription(
      userId,
      'FREE',
      'ACTIVE',
      new Date(),
      new Date(Date.now() + 86400000 * 30)
    );

    return defaultSub;
  }

  static async upgradePlan(userId: string, tier: SubscriptionTier): Promise<string> {
    // Generate Stripe checkout session URL in background
    const checkoutUrl = await MockPaymentProvider.createCheckoutSession(userId, tier);

    // Update subscription via repository
    const updatedSub = await this.repository.saveSubscription(
      userId,
      tier,
      'ACTIVE',
      new Date(),
      new Date(Date.now() + 86400000 * 30)
    );

    // Broadcast Subscription Change Event to EventBus
    await EventBus.publish('SUBSCRIPTION_CHANGED', {
      userId,
      previousPlan: 'FREE',
      newPlan: tier,
    });

    return checkoutUrl;
  }
}
