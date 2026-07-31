import { IProjectRepository, ProjectEntity } from './project-repository-interface';

export class MockProjectRepository implements IProjectRepository {
  private static projects: ProjectEntity[] = [
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Cortex Platform Launch',
      description: 'Building and launching the premier AI Productivity Operating System.',
      ownerId: '11111111-1111-1111-1111-111111111111',
      organizationId: '22222222-2222-2222-2222-222222222222',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'project-mock-2',
      name: 'Mobile App PWA Development',
      description: 'Configuring service workers, responsive layouts, and IndexedDB sync capabilities.',
      ownerId: '11111111-1111-1111-1111-111111111111',
      organizationId: '22222222-2222-2222-2222-222222222222',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  async getProjects(userId: string): Promise<ProjectEntity[]> {
    return MockProjectRepository.projects.filter(p => p.ownerId === userId && !p.deletedAt);
  }

  async getProjectById(id: string): Promise<ProjectEntity | null> {
    const project = MockProjectRepository.projects.find(p => p.id === id && !p.deletedAt);
    return project || null;
  }

  async createProject(userId: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const newProject: ProjectEntity = {
      id: `project-mock-${Date.now()}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      ownerId: userId,
      organizationId: projectData.organizationId || null,
      status: projectData.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MockProjectRepository.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity | null> {
    const idx = MockProjectRepository.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const updated = {
      ...MockProjectRepository.projects[idx],
      ...projectData,
      updatedAt: new Date(),
    };
    MockProjectRepository.projects[idx] = updated;
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const idx = MockProjectRepository.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    
    // Soft delete
    MockProjectRepository.projects[idx].deletedAt = new Date();
    return true;
  }
}
