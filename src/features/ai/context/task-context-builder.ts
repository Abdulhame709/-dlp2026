import { TaskService } from '@/features/tasks/services/task-service';

export class TaskContextBuilder {
  /**
   * Compiles the user's active task list into optimized XML context
   */
  static async buildPromptContext(userId: string): Promise<string> {
    try {
      const tasks = await TaskService.getUserTasks(userId);
      const activeTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'ARCHIVED');

      let xml = '<active_tasks_context>\n';
      
      activeTasks.forEach(task => {
        xml += `  <task id="${task.id}">
    <title>${task.title}</title>
    <status>${task.status}</status>
    <priority>${task.priority}</priority>
    ${task.description ? `<description>${task.description}</description>` : ''}
    ${task.dueDate ? `<due_date>${task.dueDate.toISOString()}</due_date>` : ''}
  </task>\n`;
      });

      xml += '</active_tasks_context>';
      return xml.trim();
    } catch (err: any) {
      return `<tasks_context_error>${err.message}</tasks_context_error>`;
    }
  }
}
