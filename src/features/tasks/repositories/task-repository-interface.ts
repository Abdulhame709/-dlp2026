import { Task, TaskStatus, TaskPriority } from '@/core/types/task-types';

export interface ITaskRepository {
  getTasks(
    userId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; projectId?: string }
  ): Promise<Task[]>;
  
  getTaskById(id: string): Promise<Task | null>;
  
  createTask(userId: string, taskData: Partial<Task>): Promise<Task>;
  
  updateTask(id: string, updateData: Partial<Task>): Promise<Task | null>;
  
  deleteTask(id: string): Promise<boolean>;
  
  completeTask(id: string): Promise<Task | null>;
}
