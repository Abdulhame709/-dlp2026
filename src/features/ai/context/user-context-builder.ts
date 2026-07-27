import { AnalyticsService } from '@/features/analytics/analytics-service';

export class UserContextBuilder {
  /**
   * Compiles the user's complete profile and intelligence behavioral data into structured XML context
   */
  static async buildPromptContext(userId: string): Promise<string> {
    try {
      const profile = await AnalyticsService.getUserProfile(userId);
      const metrics = await AnalyticsService.getMetrics(userId);

      return `
<user_context>
  <user_id>${userId}</user_id>
  <profile>
    <preferred_working_hours>
      <start>${profile.preferredWorkingHours.start}</start>
      <end>${profile.preferredWorkingHours.end}</end>
    </preferred_working_hours>
    <favored_categories>${profile.favoredTaskCategories.join(', ')}</favored_categories>
  </profile>
  <intelligence_profile>
    <productivity_pattern>${profile.productivityPattern}</productivity_pattern>
    <completion_behavior>${profile.completionBehavior}</completion_behavior>
    <delay_frequency_percentage>${profile.delayFrequency}%</delay_frequency_percentage>
  </intelligence_profile>
  <recent_metrics>
    <productivity_score>${metrics.productivityScore}/100</productivity_score>
    <completion_rate>${metrics.taskCompletionRate}%</completion_rate>
    <velocity>${metrics.taskVelocity} tasks/day</velocity>
    <focus_minutes>${metrics.focusTimeMinutes}</focus_minutes>
  </recent_metrics>
</user_context>
      `.trim();
    } catch (err: any) {
      return `<user_context_error>${err.message}</user_context_error>`;
    }
  }
}
