import { ProjectService } from '@/core/services/domain-services';

export class ProjectContextBuilder {
  /**
   * Compiles the user's active projects and milestones into optimized XML context
   */
  static async buildPromptContext(userId: string): Promise<string> {
    try {
      const projects = await ProjectService.getProjects(userId);
      const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED');

      let xml = '<active_projects_context>\n';
      
      activeProjects.forEach(project => {
        xml += `  <project id="${project.id}">
    <name>${project.name}</name>
    <status>${project.status || 'Active'}</status>
    ${project.description ? `<description>${project.description}</description>` : ''}
  </project>\n`;
      });

      xml += '</active_projects_context>';
      return xml.trim();
    } catch (err: any) {
      return `<projects_context_error>${err.message}</projects_context_error>`;
    }
  }
}
