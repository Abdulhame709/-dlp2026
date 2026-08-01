import { 
  AnalyticsEvent, 
  ProductivityMetrics, 
  UserIntelligenceProfile, 
  TimeAggregationReport, 
  TimeAggregationRange 
} from './analytics-types';

export interface IAnalyticsRepository {
  recordEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<AnalyticsEvent>;
  
  getProductivityMetrics(userId: string): Promise<ProductivityMetrics>;
  
  getUserIntelligenceProfile(userId: string): Promise<UserIntelligenceProfile>;
  
  getAggregationReport(userId: string, range: TimeAggregationRange): Promise<TimeAggregationReport>;
  
  getRawEvents(userId: string): Promise<AnalyticsEvent[]>;
}
