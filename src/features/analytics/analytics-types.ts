export type TimeAggregationRange = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface ProductivityMetrics {
  productivityScore: number; // 0 to 100
  taskCompletionRate: number; // percent (0 to 100)
  taskVelocity: number; // tasks completed per day
  focusTimeMinutes: number;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  overdueTasksCount: number;
}

export interface UserIntelligenceProfile {
  userId: string;
  productivityPattern: string; // e.g. "Peak efficiency detected between 9 AM and 12 PM"
  preferredWorkingHours: {
    start: string;
    end: string;
  };
  completionBehavior: string; // e.g. "Completes critical tasks 1.4x faster before noon"
  priorityHandling: Record<string, number>; // e.g. { CRITICAL: 95, HIGH: 80 } completion percents
  delayFrequency: number; // percent of delayed tasks
  favoredTaskCategories: string[];
}

export interface TimeAggregationReport {
  range: TimeAggregationRange;
  completionPercentage: number;
  growthRate: number; // compared to previous range
  averageCompletionTimeMinutes: number;
  averageDelayTimeMinutes: number;
  totalActivitiesCount: number;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId: string;
  organizationId?: string | null;
  timestamp: Date;
  metadata: {
    actor?: string;
    source?: string;
    device?: string;
    session?: string;
    beforeState?: any;
    afterState?: any;
    [key: string]: any;
  };
}
