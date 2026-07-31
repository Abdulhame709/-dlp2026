import { UserContextBuilder } from '../context/user-context-builder';
import { GoalContextBuilder } from '../context/goal-context-builder';
import { ProjectContextBuilder } from '../context/project-context-builder';
import { TaskContextBuilder } from '../context/task-context-builder';

export class AIContextManager {
  /**
   * Orchestrates and compiles active user, goal, project, and task contexts simultaneously
   */
  static async compileFullContext(userId: string): Promise<{ 
    userProfile: string; 
    activeGoals: string; 
    activeProjects: string; 
    activeTasks: string; 
  }> {
    const [userProfile, activeGoals, activeProjects, activeTasks] = await Promise.all([
      UserContextBuilder.buildPromptContext(userId),
      GoalContextBuilder.buildPromptContext(userId),
      ProjectContextBuilder.buildPromptContext(userId),
      TaskContextBuilder.buildPromptContext(userId),
    ]);

    return {
      userProfile,
      activeGoals,
      activeProjects,
      activeTasks,
    };
  }
}
