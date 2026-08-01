import { OrganizationEntity } from './supabase-organization-repository';

export interface IOrganizationRepository {
  getOrganization(id: string): Promise<OrganizationEntity | null>;

  updateOrganization(id: string, name: string, logoUrl?: string): Promise<OrganizationEntity | null>;

  getUserOrganizations(userId: string): Promise<OrganizationEntity[]>;

  createOrganization(name: string, ownerId: string, logoUrl?: string): Promise<OrganizationEntity | null>;

  deleteOrganization(id: string): Promise<boolean>;
}
