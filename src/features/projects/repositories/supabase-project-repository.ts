import { createClient } from '@/core/database/connection';
import { IProjectRepository, ProjectEntity } from './project-repository-interface';

export class SupabaseProjectRepository implements IProjectRepository {
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
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
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

  async getProjectById(id: string): Promise<ProjectEntity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  async createProject(userId: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name || 'Untitled Project',
        description: projectData.description || '',
        owner_id: userId,
        organization_id: projectData.organizationId || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`PROJECT_INSERT_FAILED: ${error?.message || 'Empty response'}`);
    return this.mapRowToEntity(data);
  }

  async updateProject(id: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity | null> {
    const supabase = await createClient();
    const dbRow: Record<string, any> = {};
    if (projectData.name !== undefined) dbRow.name = projectData.name;
    if (projectData.description !== undefined) dbRow.description = projectData.description;
    if (projectData.status !== undefined) dbRow.status = projectData.status;

    const { data, error } = await supabase
      .from('projects')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(`PROJECT_UPDATE_FAILED: ${error?.message || 'Update failed'}`);
    return this.mapRowToEntity(data);
  }

  async deleteProject(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
}
