import { SubscriptionTier, UserSubscription } from './billing-types';
import { createClient } from '@/core/database/connection';

export class SupabaseBillingRepository {
  private mapRowToEntity(row: any): UserSubscription {
    return {
      id: row.id,
      userId: row.user_id,
      planName: row.plan_name as SubscriptionTier,
      status: row.status as 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED',
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
    };
  }

  async getSubscription(userId: string): Promise<UserSubscription | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  async saveSubscription(
    userId: string,
    tier: SubscriptionTier,
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED',
    startDate: Date,
    endDate: Date
  ): Promise<UserSubscription> {
    const supabase = await createClient();

    const dbRow = {
      user_id: userId,
      plan_name: tier,
      status,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    // Upsert subscription mapping
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(dbRow, { onConflict: 'user_id' })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`SUBSCRIPTION_SAVE_FAILED: ${error?.message}`);
    }

    return this.mapRowToEntity(data);
  }
}
export type { SubscriptionTier, UserSubscription };
