import { Task, TaskStatus, TaskPriority } from '@/core/types/task-types';
import { TaskStateMachine } from '../services/task-state-machine';

// In-memory mock DB seeded with default entities matching our seed.ts file
let mockTasksTable: Task[] = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    userId: '11111111-1111-1111-1111-111111111111',
    organizationId: '22222222-2222-2222-2222-222222222222',
    projectId: '44444444-4444-4444-4444-444444444444',
    goalId: '55555555-5555-5555-5555-555555555554',
    title: 'Deploy Database Schema with RLS',
    description: 'Configure and test Supabase PostgreSQL security policies.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    createdAt: new Date('2026-07-27T20:00:00.000Z'),
    updatedAt: new Date('2026-07-27T20:00:00.000Z'),
  },
  {
    id: '66666666-6666-6666-6666-666666666662',
    userId: '11111111-1111-1111-1111-111111111111',
    organizationId: '22222222-2222-2222-2222-222222222222',
    projectId: '44444444-4444-4444-4444-444444444444',
    title: 'Setup GitHub Actions CI/CD Pipeline',
    description: 'Verify linting, testing, and deployment scripts automations.',
    status: 'PLANNED',
    priority: 'HIGH',
    createdAt: new Date('2026-07-27T20:10:00.000Z'),
    updatedAt: new Date('2026-07-27T20:10:00.000Z'),
  },
];

export class MockTaskRepository {
  static async getTasks(userId: string, filters?: { status?: TaskStatus; priority?: TaskPriority; projectId?: string }): Promise<Task[]> {
    let tasks = mockTasksTable.filter(t => t.userId === userId && !t.deletedAt);

    if (filters) {
      if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
      if (filters.priority) tasks = tasks.filter(t => t.priority === filters.priority);
      if (filters.projectId) tasks = tasks.filter(t => t.projectId === filters.projectId);
    }

    return tasks;
  }

  static async getTaskById(id: string): Promise<Task | null> {
    const task = mockTasksTable.find(t => t.id === id && !t.deletedAt);
    return task || null;
  }

  static async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    const newTask: Task = {
      id: `task-uuid-${Date.now()}`,
      userId,
      organizationId: taskData.organizationId || null,
      projectId: taskData.projectId || null,
      goalId: taskData.goalId || null,
      parentTaskId: taskData.parentTaskId || null,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || null,
      status: (taskData.status as TaskStatus) || 'INBOX',
      priority: (taskData.priority as TaskPriority) || 'MEDIUM',
      dueDate: taskData.dueDate || null,
      estimatedDuration: taskData.estimatedDuration || null,
      actualDuration: taskData.actualDuration || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTasksTable.push(newTask);
    return newTask;
  }

  static async updateTask(id: string, updateData: Partial<Task>): Promise<Task | null> {
    const taskIndex = mockTasksTable.findIndex(t => t.id === id && !t.deletedAt);
    if (taskIndex === -1) return null;

    const task = mockTasksTable[taskIndex];

    // Safe status transition check
    let targetStatus = task.status;
    if (updateData.status && updateData.status !== task.status) {
      targetStatus = TaskStateMachine.transition(task.status, updateData.status as TaskStatus);
    }

    const updatedTask: Task = {
      ...task,
      ...updateData,
      status: targetStatus,
      updatedAt: new Date(),
    };

    mockTasksTable[taskIndex] = updatedTask;
    return updatedTask;
  }

  static async deleteTask(id: string): Promise<boolean> {
    const taskIndex = mockTasksTable.findIndex(t => t.id === id && !t.deletedAt);
    if (taskIndex === -1) return false;

    // Apply soft delete
    mockTasksTable[taskIndex].deletedAt = new Date();
    mockTasksTable[taskIndex].updatedAt = new Date();
    return true;
  }

  static async completeTask(id: string): Promise<Task | null> {
    return this.updateTask(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });
  }
}
