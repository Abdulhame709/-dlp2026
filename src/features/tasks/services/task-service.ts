import { Task, TaskStatus, TaskPriority } from '@/core/types/task-types';
import { ITaskRepository } from '../repositories/task-repository-interface';
import { DependencyInjector } from '@/core/config/dependency-injector';
import { EventBus } from '@/core/utils/event-bus';

export class TaskService {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): ITaskRepository {
    return DependencyInjector.getTaskRepository();
  }

  /**
   * Retrieves active tasks for user
   */
  static async getUserTasks(
    userId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; projectId?: string }
  ): Promise<Task[]> {
    return this.repository.getTasks(userId, filters);
  }

  /**
   * Creates a new task and triggers Domain Event
   */
  static async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    const task = await this.repository.createTask(userId, taskData);
    
    // Broadcast Domain Event across the Event Bus
    await EventBus.publish('TaskCreated', { userId, task });

    return task;
  }

  /**
   * Patches an existing task fields with safety checks
   */
  static async updateTask(id: string, updateData: Partial<Task>): Promise<Task | null> {
    const task = await this.repository.updateTask(id, updateData);
    if (!task) return null;

    // Broadcast Domain Event
    await EventBus.publish('TaskUpdated', { taskId: id, task });

    return task;
  }

  /**
   * Marks task as completed, logs timestamp and triggers Domain Event
   */
  static async completeTask(id: string): Promise<Task | null> {
    const task = await this.repository.completeTask(id);
    if (!task) return null;

    // Broadcast Domain Event
    await EventBus.publish('TaskCompleted', { taskId: id, task });

    return task;
  }

  /**
   * Soft-deletes a task and triggers Domain Event
   */
  static async deleteTask(id: string): Promise<boolean> {
    const success = await this.repository.deleteTask(id);
    if (success) {
      // Broadcast Domain Event
      await EventBus.publish('TaskDeleted', { taskId: id });
    }
    return success;
  }
}
export type { ITaskRepository };
