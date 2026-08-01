import { EventBus } from '@/core/utils/event-bus';
import { IAnalyticsRepository } from './analytics-repository-interface';
import { DependencyInjector } from '@/core/config/dependency-injector';
import { 
  ProductivityMetrics, 
  UserIntelligenceProfile, 
  TimeAggregationReport, 
  TimeAggregationRange 
} from './analytics-types';

export class AnalyticsService {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): IAnalyticsRepository {
    return DependencyInjector.getAnalyticsRepository();
  }

  /**
   * Initialize and wire up subscribers to intercept central EventBus events
   */
  static initialize() {
    console.log('🔌 Analytics Pipeline: Subscribing to EventBus domain events...');

    // Intercept Task Creation
    EventBus.subscribe('TaskCreated', async (data) => {
      await this.repository.recordEvent({
        eventName: 'TaskCreated',
        userId: data.userId || '11111111-1111-1111-1111-111111111111',
        metadata: {
          actor: data.userId,
          source: 'web',
          device: 'macbook',
          afterState: data.task,
        },
      });
    });

    // Intercept Task Updates
    EventBus.subscribe('TaskUpdated', async (data) => {
      await this.repository.recordEvent({
        eventName: 'TaskUpdated',
        userId: data.task?.userId || '11111111-1111-1111-1111-111111111111',
        metadata: {
          taskId: data.taskId,
          afterState: data.task,
        },
      });
    });

    // Intercept Task Completion
    EventBus.subscribe('TaskCompleted', async (data) => {
      await this.repository.recordEvent({
        eventName: 'TaskCompleted',
        userId: data.task?.userId || '11111111-1111-1111-1111-111111111111',
        metadata: {
          taskId: data.taskId,
          afterState: {
            ...data.task,
            actual_duration: data.task.actualDuration || 120, // simulate 120 minutes focus
          },
        },
      });
    });

    // Intercept Task Deletion
    EventBus.subscribe('TaskDeleted', async (data) => {
      await this.repository.recordEvent({
        eventName: 'TaskDeleted',
        userId: data.task?.userId || '11111111-1111-1111-1111-111111111111',
        metadata: {
          taskId: data.taskId,
        },
      });
    });
  }

  /**
   * Resolve productivity metrics
   */
  static async getMetrics(userId: string): Promise<ProductivityMetrics> {
    return this.repository.getProductivityMetrics(userId);
  }

  /**
   * Resolve user behavioral profiling
   */
  static async getUserProfile(userId: string): Promise<UserIntelligenceProfile> {
    return this.repository.getUserIntelligenceProfile(userId);
  }

  /**
   * Retrieve dynamic aggregated performance records
   */
  static async getReport(userId: string, range: TimeAggregationRange): Promise<TimeAggregationReport> {
    return this.repository.getAggregationReport(userId, range);
  }
}
export type { IAnalyticsRepository };
