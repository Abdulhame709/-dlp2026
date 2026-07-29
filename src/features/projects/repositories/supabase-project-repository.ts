import { createClient } from '@/core/database/connection';

export interface ProjectEntity {
  id: string;
  organizationId?: string | null;
  ownerId: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SupabaseProjectRepository {
  private mapRowToEntity(row: any): ProjectEntity {
    return {
      id: row.id,
      organizationId: row.organization_id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getProjects(userId: string): Promise<ProjectEntity[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .is('deleted_at', null);

    if (error) throw new Error(`PROJECTS_QUERY_FAILED: ${error.message}`);
    return (data || []).map(row => this.mapRowToEntity(row));
  }

  async createProject(userId: string, name: string, description = '', organizationId?: string): Promise<ProjectEntity> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        owner_id: userId,
        organization_id: organizationId || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`PROJECT_INSERT_FAILED: ${error?.message || 'Empty response'}`);
    return this.mapRowToEntity(data);
  }
}
