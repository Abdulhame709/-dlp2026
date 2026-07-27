import { 
  AnalyticsEvent, 
  ProductivityMetrics, 
  UserIntelligenceProfile, 
  TimeAggregationReport, 
  TimeAggregationRange 
} from './analytics-types';
import { IAnalyticsRepository } from './analytics-repository-interface';

// Local in-memory store for high-frequency Telemetry events
const mockEventsTable: AnalyticsEvent[] = [
  {
    id: 'event-1',
    eventName: 'TaskCreated',
    userId: '11111111-1111-1111-1111-111111111111',
    timestamp: new Date(Date.now() - 86400000 * 5),
    metadata: { source: 'web', device: 'macbook', session: 'sess-1' }
  },
  {
    id: 'event-2',
    eventName: 'TaskCompleted',
    userId: '11111111-1111-1111-1111-111111111111',
    timestamp: new Date(Date.now() - 86400000 * 3),
    metadata: { source: 'web', device: 'macbook', session: 'sess-1', afterState: { actual_duration: 120 } }
  },
  {
    id: 'event-3',
    eventName: 'GoalUpdated',
    userId: '11111111-1111-1111-1111-111111111111',
    timestamp: new Date(Date.now() - 86400000 * 1),
    metadata: { source: 'mobile', device: 'iphone', session: 'sess-2', beforeState: { progress: 30 }, afterState: { progress: 45 } }
  }
];

export class MockAnalyticsRepository implements IAnalyticsRepository {
  async recordEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<AnalyticsEvent> {
    const newEvent: AnalyticsEvent = {
      id: `event-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...eventData,
    };
    mockEventsTable.push(newEvent);
    return newEvent;
  }

  async getProductivityMetrics(userId: string): Promise<ProductivityMetrics> {
    const userEvents = mockEventsTable.filter(e => e.userId === userId);
    const createdCount = userEvents.filter(e => e.eventName === 'TaskCreated').length;
    const completedCount = userEvents.filter(e => e.eventName === 'TaskCompleted').length;

    // Evaluate dynamic focus time from events metadata
    let focusMinutes = 0;
    userEvents.forEach(e => {
      if (e.metadata?.afterState?.actual_duration) {
        focusMinutes += Number(e.metadata.afterState.actual_duration);
      }
    });

    const completionRate = createdCount > 0 ? Math.round((completedCount / createdCount) * 100) : 85;

    return {
      productivityScore: Math.min(100, Math.round(completionRate * 0.7 + (focusMinutes / 60) * 10)),
      taskCompletionRate: completionRate,
      taskVelocity: Math.round((completedCount / 7) * 10) / 10, // weekly average per day
      focusTimeMinutes: focusMinutes || 120, // default/seeded
      totalTasksCompleted: completedCount || 4,
      totalTasksCreated: createdCount || 5,
      overdueTasksCount: 1, // seeded
    };
  }

  async getUserIntelligenceProfile(userId: string): Promise<UserIntelligenceProfile> {
    return {
      userId,
      productivityPattern: 'Peak efficiency detected between 9 AM and 12 PM.',
      preferredWorkingHours: {
        start: '09:00',
        end: '17:00',
      },
      completionBehavior: 'Completes critical tasks 1.4x faster before noon.',
      priorityHandling: {
        CRITICAL: 95,
        HIGH: 82,
        MEDIUM: 70,
        LOW: 50,
      },
      delayFrequency: 12, // 12% tasks delayed
      favoredTaskCategories: ['Database', 'Architecture', 'AI Engineering', 'Integrations'],
    };
  }

  async getAggregationReport(userId: string, range: TimeAggregationRange): Promise<TimeAggregationReport> {
    return {
      range,
      completionPercentage: 88,
      growthRate: 12.5, // 12.5% increase compared to previous range
      averageCompletionTimeMinutes: 145, // 2.4 hours average
      averageDelayTimeMinutes: 35,
      totalActivitiesCount: mockEventsTable.filter(e => e.userId === userId).length,
    };
  }

  async getRawEvents(userId: string): Promise<AnalyticsEvent[]> {
    return mockEventsTable.filter(e => e.userId === userId);
  }
}
