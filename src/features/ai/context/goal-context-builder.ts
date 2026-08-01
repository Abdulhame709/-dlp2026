import { GoalService } from '@/core/services/domain-services';

export class GoalContextBuilder {
  /**
   * Compiles the user's active goals and strategic plans into optimized XML context
   */
  static async buildPromptContext(userId: string): Promise<string> {
    try {
      const goals = await GoalService.getGoals(userId);
      const activeGoals = goals.filter(g => g.status !== 'COMPLETED' && g.status !== 'ARCHIVED');

      let xml = '<active_goals_context>\n';
      
      activeGoals.forEach(goal => {
        xml += `  <goal id="${goal.id}">
    <title>${goal.title}</title>
    <status>${goal.status}</status>
    <progress>${goal.progress || 0}%</progress>
    ${goal.description ? `<description>${goal.description}</description>` : ''}
  </goal>\n`;
      });

      xml += '</active_goals_context>';
      return xml.trim();
    } catch (err: any) {
      return `<goals_context_error>${err.message}</goals_context_error>`;
    }
  }
}
