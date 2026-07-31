export interface ProjectEntity {
  id: string;
  organizationId?: string | null;
  ownerId: string;
  name: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IProjectRepository {
  getProjects(userId: string): Promise<ProjectEntity[]>;
  getProjectById(id: string): Promise<ProjectEntity | null>;
  createProject(userId: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity>;
  updateProject(id: string, projectData: Partial<ProjectEntity>): Promise<ProjectEntity | null>;
  deleteProject(id: string): Promise<boolean>;
}
