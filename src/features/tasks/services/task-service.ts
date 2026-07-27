import { Task, TaskStatus, TaskPriority } from '@/core/types/task-types';
import { MockTaskRepository } from '../repositories/mock-task-repository';
import { Logger } from '@/core/logging/logger';

export class TaskService {
  /**
   * Retrieves active tasks for user
   */
  static async getUserTasks(
    userId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; projectId?: string }
  ): Promise<Task[]> {
    return MockTaskRepository.getTasks(userId, filters);
  }

  /**
   * Creates a new task and logs telemetry
   */
  static async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    const task = await MockTaskRepository.createTask(userId, taskData);
    
    // Telemetry log tracking
    await Logger.info('Task Created', {
      userId,
      taskId: task.id,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
    });

    return task;
  }

  /**
   * Patches an existing task fields with safety checks
   */
  static async updateTask(id: string, updateData: Partial<Task>): Promise<Task | null> {
    const task = await MockTaskRepository.updateTask(id, updateData);
    if (!task) return null;

    await Logger.info('Task Updated', {
      taskId: task.id,
      userId: task.userId,
      status: task.status,
    });

    return task;
  }

  /**
   * Marks task as completed, logs timestamp and triggers telemetry
   */
  static async completeTask(id: string): Promise<Task | null> {
    const task = await MockTaskRepository.completeTask(id);
    if (!task) return null;

    await Logger.info('Task Completed', {
      taskId: task.id,
      userId: task.userId,
    });

    return task;
  }

  /**
   * Soft-deletes a task
   */
  static async deleteTask(id: string): Promise<boolean> {
    const success = await MockTaskRepository.deleteTask(id);
    if (success) {
      await Logger.info('Task Deleted', { taskId: id });
    }
    return success;
  }
}
