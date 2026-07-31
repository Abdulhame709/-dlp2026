import { createClient } from '@/core/database/connection';
import { IGoalRepository, GoalEntity } from './goal-repository-interface';

export class SupabaseGoalRepository implements IGoalRepository {
  private mapRowToEntity(row: any): GoalEntity {
    return {
      id: row.id,
      userId: row.user_id,
      organizationId: row.organization_id,
      title: row.title,
      description: row.description,
      deadline: row.deadline ? new Date(row.deadline) : null,
      status: row.status,
      progress: row.progress || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }

  async getGoals(userId: string): Promise<GoalEntity[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw new Error(`GOALS_QUERY_FAILED: ${error.message}`);
    return (data || []).map(row => this.mapRowToEntity(row));
  }

  async getGoalById(id: string): Promise<GoalEntity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  async createGoal(userId: string, goalData: Partial<GoalEntity>): Promise<GoalEntity> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .insert({
        title: goalData.title || 'Untitled Goal',
        description: goalData.description || '',
        progress: goalData.progress || 0,
        user_id: userId,
        organization_id: goalData.organizationId || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`GOAL_INSERT_FAILED: ${error?.message || 'Empty response'}`);
    return this.mapRowToEntity(data);
  }

  async updateGoal(id: string, goalData: Partial<GoalEntity>): Promise<GoalEntity | null> {
    const supabase = await createClient();
    const dbRow: Record<string, any> = {};
    if (goalData.title !== undefined) dbRow.title = goalData.title;
    if (goalData.description !== undefined) dbRow.description = goalData.description;
    if (goalData.progress !== undefined) dbRow.progress = goalData.progress;
    if (goalData.status !== undefined) dbRow.status = goalData.status;

    const { data, error } = await supabase
      .from('goals')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`GOAL_UPDATE_FAILED: ${error?.message || 'Update failed'}`);
    return this.mapRowToEntity(data);
  }

  async deleteGoal(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('goals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
}
