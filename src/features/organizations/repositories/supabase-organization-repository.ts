import { createClient } from '@/core/database/connection';

export interface OrganizationEntity {
  id: string;
  name: string;
  logoUrl?: string | null;
  ownerId: string;
  subscriptionPlan: string;
  createdAt: Date;
}

export class SupabaseOrganizationRepository {
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
}
