import { IOrganizationRepository } from './organization-repository-interface';
import { OrganizationEntity } from './supabase-organization-repository';

// Local in-memory store for development/testing
const mockOrganizations: OrganizationEntity[] = [
  {
    id: 'org-1',
    name: 'Cortex Founders Inc.',
    ownerId: '11111111-1111-1111-1111-111111111111',
    subscriptionPlan: 'PRO',
    createdAt: new Date(),
  },
  {
    id: 'org-2',
    name: 'Personal workspace',
    ownerId: '11111111-1111-1111-1111-111111111111',
    subscriptionPlan: 'FREE',
    createdAt: new Date(),
  },
];

export class MockOrganizationRepository implements IOrganizationRepository {
  async getOrganization(id: string): Promise<OrganizationEntity | null> {
    return mockOrganizations.find(o => o.id === id) || null;
  }

  async updateOrganization(id: string, name: string, logoUrl?: string): Promise<OrganizationEntity | null> {
    const org = mockOrganizations.find(o => o.id === id);
    if (!org) return null;

    org.name = name;
    if (logoUrl !== undefined) org.logoUrl = logoUrl;

    return org;
  }

  async getUserOrganizations(userId: string): Promise<OrganizationEntity[]> {
    return mockOrganizations.filter(o => o.ownerId === userId);
  }
}
