import { Task, TaskStatus, TaskPriority } from '@/core/types/task-types';
import { ITaskRepository } from './task-repository-interface';
import { createClient } from '@/core/database/server';

export class SupabaseTaskRepository implements ITaskRepository {
  /**
   * Translates database snake_case row record into camelCase Task Entity
   */
  private mapRowToEntity(row: any): Task {
    return {
      id: row.id,
      userId: row.user_id,
      organizationId: row.organization_id,
      projectId: row.project_id,
      goalId: row.goal_id,
      parentTaskId: row.parent_task_id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      dueDate: row.due_date ? new Date(row.due_date) : null,
      estimatedDuration: row.estimated_duration,
      actualDuration: row.actual_duration,
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }

  /**
   * Retrieves active tasks for user from real PostgreSQL
   */
  async getTasks(
    userId: string,
    filters?: { status?: TaskStatus; priority?: TaskPriority; projectId?: string }
  ): Promise<Task[]> {
    const supabase = await createClient();
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.projectId) query = query.eq('project_id', filters.projectId);
    }

    // Sort by priority or creation order
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`DATABASE_QUERY_ERROR: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToEntity(row));
  }

  /**
   * Retrieves single task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  /**
   * Insert new task to PostgreSQL
   */
  async createTask(userId: string, taskData: Partial<Task>): Promise<Task> {
    const supabase = await createClient();
    
    const dbRow = {
      user_id: userId,
      organization_id: taskData.organizationId || null,
      project_id: taskData.projectId || null,
      goal_id: taskData.goalId || null,
      parent_task_id: taskData.parentTaskId || null,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || null,
      status: taskData.status || 'INBOX',
      priority: taskData.priority || 'MEDIUM',
      due_date: taskData.dueDate ? taskData.dueDate.toISOString() : null,
      estimated_duration: taskData.estimatedDuration || null,
      actual_duration: taskData.actualDuration || null,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(dbRow)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`DATABASE_INSERT_ERROR: ${error?.message || 'Empty response'}`);
    }

    return this.mapRowToEntity(data);
  }

  /**
   * Update task fields inside database
   */
  async updateTask(id: string, updateData: Partial<Task>): Promise<Task | null> {
    const supabase = await createClient();

    const dbRow: Record<string, any> = {};
    if (updateData.title !== undefined) dbRow.title = updateData.title;
    if (updateData.description !== undefined) dbRow.description = updateData.description;
    if (updateData.status !== undefined) dbRow.status = updateData.status;
    if (updateData.priority !== undefined) dbRow.priority = updateData.priority;
    if (updateData.dueDate !== undefined) dbRow.due_date = updateData.dueDate ? updateData.dueDate.toISOString() : null;
    if (updateData.estimatedDuration !== undefined) dbRow.estimated_duration = updateData.estimatedDuration;
    if (updateData.actualDuration !== undefined) dbRow.actual_duration = updateData.actualDuration;
    if (updateData.completedAt !== undefined) dbRow.completed_at = updateData.completedAt ? updateData.completedAt.toISOString() : null;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`DATABASE_UPDATE_ERROR: ${error?.message || 'Update failed'}`);
    }

    return this.mapRowToEntity(data);
  }

  /**
   * Triggers soft-delete (setting deleted_at column)
   */
  async deleteTask(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }

  /**
   * Explicitly completes task and records completion date
   */
  async completeTask(id: string): Promise<Task | null> {
    return this.updateTask(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });
  }
}
