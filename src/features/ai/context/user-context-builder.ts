import { AnalyticsService } from '@/features/analytics/analytics-service';
import { LongTermMemoryManager } from '../memory/long-term-memory';

export class UserContextBuilder {
  /**
   * Compiles the user's complete profile, intelligence data, and long-term memories into structured XML context
   */
  static async buildPromptContext(userId: string): Promise<string> {
    try {
      const profile = await AnalyticsService.getUserProfile(userId);
      const metrics = await AnalyticsService.getMetrics(userId);
      
      // Query active long-term memories to personalize AI context
      const memories = await LongTermMemoryManager.getMemories(userId);
      const memoriesXml = memories
        .map(
          (m) =>
            `    <memory type="${m.memoryType}" importance="${m.importanceScore}">${m.content}</memory>`
        )
        .join('\n');

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
  <long_term_memories>
${memoriesXml || '    <memory>No active long-term memories recorded yet.</memory>'}
  </long_term_memories>
</user_context>
      `.trim();
    } catch (err: any) {
      return `<user_context_error>${err.message}</user_context_error>`;
    }
  }
}
