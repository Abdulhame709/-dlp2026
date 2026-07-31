import { Logger } from '@/core/logging/logger';

export interface TokenUsageRecord {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  timestamp: number;
}

const dailyQuotaTable = new Map<string, number>(); // userId -> accumulated tokens today
const usageHistoryTable: TokenUsageRecord[] = [];

export class AICostDashboard {
  // Enforced daily token quotas per subscription tier
  private static readonly dailyLimits = {
    FREE: 10000,       // Max 10K tokens/day (light support)
    PRO: 150000,      // Max 150K tokens/day
    ENTERPRISE: 1000000 // Max 1M tokens/day
  };

  /**
   * Check if a user has sufficient daily quota before dispatching request
   */
  static hasSufficientQuota(userId: string, plan: 'FREE' | 'PRO' | 'ENTERPRISE'): boolean {
    const todayUsed = dailyQuotaTable.get(userId) || 0;
    const limit = this.dailyLimits[plan];
    return todayUsed < limit;
  }

  /**
   * Track token consumption and increment user daily counters
   */
  static async recordUsage(
    userId: string,
    plan: 'FREE' | 'PRO' | 'ENTERPRISE',
    promptTokens: number,
    completionTokens: number,
    provider: string
  ): Promise<void> {
    const totalTokens = promptTokens + completionTokens;
    const currentUsed = dailyQuotaTable.get(userId) || 0;
    dailyQuotaTable.set(userId, currentUsed + totalTokens);

    // Calculate approximate cost ($0.015 per 1K for OpenAI/Standard models)
    const ratePer1K = 0.015;
    const estimatedCost = (totalTokens / 1000) * ratePer1K;

    const record: TokenUsageRecord = {
      userId,
      promptTokens,
      completionTokens,
      estimatedCost,
      timestamp: Date.now(),
    };

    usageHistoryTable.push(record);

    await Logger.info('AI Usage Recorded', {
      userId,
      totalTokens,
      accumulatedTokensToday: currentUsed + totalTokens,
      quotaLimit: this.dailyLimits[plan],
      estimatedCost,
      provider,
    });
  }

  /**
   * Reset the global daily quotas (runs automatically via Cron in production)
   */
  static resetDailyQuotas(): void {
    dailyQuotaTable.clear();
    console.log('🧠 AI Cost Control: Daily token quotas reset successfully.');
  }

  /**
   * Query current total accumulated simulated costs
   */
  static getAccumulatedSaaSCost(): number {
    return usageHistoryTable.reduce((acc, r) => acc + r.estimatedCost, 0);
  }
}
