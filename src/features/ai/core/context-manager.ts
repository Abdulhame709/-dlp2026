import { UserContextBuilder } from '../context/user-context-builder';
import { TaskContextBuilder } from '../context/task-context-builder';

export class AIContextManager {
  /**
   * Orchestrates and compiles active user and task contexts simultaneously
   */
  static async compileFullContext(userId: string): Promise<{ userProfile: string; activeTasks: string }> {
    const [userProfile, activeTasks] = await Promise.all([
      UserContextBuilder.buildPromptContext(userId),
      TaskContextBuilder.buildPromptContext(userId),
    ]);

    return {
      userProfile,
      activeTasks,
    };
  }
}
