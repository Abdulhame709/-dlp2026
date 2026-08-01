import { IOrganizationRepository } from './organization-repository-interface';
import { createClient } from '@/core/database/connection';

export interface OrganizationEntity {
  id: string;
  name: string;
  logoUrl?: string | null;
  ownerId: string;
  subscriptionPlan: string;
  createdAt: Date;
}

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  private mapRowToEntity(row: any): OrganizationEntity {
    return {
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      ownerId: row.owner_id,
      subscriptionPlan: row.subscription_plan,
      createdAt: new Date(row.created_at),
    };
  }

  async getOrganization(id: string): Promise<OrganizationEntity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  async updateOrganization(id: string, name: string, logoUrl?: string): Promise<OrganizationEntity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .update({ name, logo_url: logoUrl || null })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return this.mapRowToEntity(data);
  }

  async getUserOrganizations(userId: string): Promise<OrganizationEntity[]> {
    const supabase = await createClient();

    // Fetch organizations where the user is a member
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization:organizations(
          id,
          name,
          logo_url,
          owner_id,
          subscription_plan,
          created_at
        ),
        role
      `)
      .eq('user_id', userId);

    if (error || !data) return [];

    // Map the joined rows to OrganizationEntity
    return data
      .filter((row: any) => row.organization)
      .map((row: any) => ({
        id: row.organization.id,
        name: row.organization.name,
        logoUrl: row.organization.logo_url,
        ownerId: row.organization.owner_id,
        subscriptionPlan: row.organization.subscription_plan,
        createdAt: new Date(row.organization.created_at),
      }));
  }

  async createOrganization(name: string, ownerId: string, logoUrl?: string): Promise<OrganizationEntity | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, owner_id: ownerId, logo_url: logoUrl || null, created_by: ownerId })
      .select()
      .single();

    if (error || !data) return null;

    // Also add the creator as OWNER member
    await supabase
      .from('organization_members')
      .insert({ organization_id: data.id, user_id: ownerId, role: 'OWNER', created_by: ownerId });

    return this.mapRowToEntity(data);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    return !error;
  }
}
