import { TaskService } from '@/features/tasks/services/task-service';
import { ConversationService } from '@/features/ai/chat/conversation-service';

export interface SearchResult {
  id: string;
  type: 'TASK' | 'CONVERSATION' | 'PROJECT' | 'ORGANIZATION';
  title: string;
  description?: string;
  url: string;
}

export class GlobalSearchService {
  /**
   * Search through multiple domains: Tasks, Projects, Organizations, and Chats
   */
  static async query(userId: string, queryText: string): Promise<SearchResult[]> {
    if (!queryText.trim()) return [];

    const lower = queryText.toLowerCase();
    const results: SearchResult[] = [];

    // Query active domains simultaneously
    try {
      const [tasks, chats] = await Promise.all([
        TaskService.getUserTasks(userId),
        ConversationService.getUserSessions(userId),
      ]);

      // 1. Search Tasks
      tasks.forEach(t => {
        if (
          t.title.toLowerCase().includes(lower) || 
          (t.description && t.description.toLowerCase().includes(lower))
        ) {
          results.push({
            id: t.id,
            type: 'TASK',
            title: t.title,
            description: t.description || undefined,
            url: `/app/tasks?task_id=${t.id}`,
          });
        }
      });

      // 2. Search Conversations
      chats.forEach(c => {
        if (c.title.toLowerCase().includes(lower)) {
          results.push({
            id: c.id,
            type: 'CONVERSATION',
            title: c.title,
            url: `/app/ai-assistant?session_id=${c.id}`,
          });
        }
      });
    } catch (err: any) {
      console.warn('Global search query encountered an error:', err.message);
    }

    return results;
  }
}
export type { SearchResult as GlobalSearchResult };
