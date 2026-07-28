import { createClient } from '@/core/database/server';

export interface GoalEntity {
  id: string;
  userId: string;
  organizationId?: string | null;
  title: string;
  description?: string | null;
  deadline?: Date | null;
  status: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SupabaseGoalRepository {
  private mapRowToEntity(row: any): GoalEntity {
    return {
      id: row.id,
      userId: row.user_id,
      organizationId: row.organization_id,
      title: row.title,
      description: row.description,
      deadline: row.deadline ? new Date(row.deadline) : null,
      status: row.status,
      progress: row.progress,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
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

  async createGoal(userId: string, title: string, description = ''): Promise<GoalEntity> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('goals')
      .insert({
        title,
        description,
        user_id: userId,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`GOAL_INSERT_FAILED: ${error?.message || 'Empty response'}`);
    return this.mapRowToEntity(data);
  }
}
