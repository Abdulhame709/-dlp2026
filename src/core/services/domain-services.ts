import { Logger } from '../logging/logger';
import { DependencyInjector } from '../config/dependency-injector';

export class ProjectService {
  private static getRepo() {
    return DependencyInjector.getProjectRepository();
  }

  static async createProject(userId: string, orgId: string | null, name: string, description = ''): Promise<any> {
    await Logger.info('Project Created', { userId, orgId, name });
    return this.getRepo().createProject(userId, { name, description, organizationId: orgId });
  }

  static async getProjects(userId: string): Promise<any[]> {
    return this.getRepo().getProjects(userId);
  }

  static async getProjectById(id: string): Promise<any | null> {
    return this.getRepo().getProjectById(id);
  }

  static async updateProject(id: string, name: string, description = '', status?: string): Promise<any | null> {
    return this.getRepo().updateProject(id, { name, description, status });
  }

  static async deleteProject(id: string): Promise<boolean> {
    return this.getRepo().deleteProject(id);
  }
}

export class GoalService {
  static async createGoal(userId: string, title: string, progress = 0): Promise<any> {
    await Logger.info('Goal Created', { userId, title });
    return { id: `goal-mock-${Date.now()}`, title, userId, progress };
  }

  static async getGoals(userId: string): Promise<any[]> {
    return [
      { id: '55555555-5555-5555-5555-555555555554', title: 'Launch Cortex MVP', progress: 45, userId },
    ];
  }
}

export class NotificationService {
  static async sendNotification(userId: string, title: string, message: string): Promise<void> {
    await Logger.info('Notification Triggered', { userId, title });
  }

  static async getNotifications(userId: string): Promise<any[]> {
    return [
      { id: 'notif-1', title: 'Welcome to Cortex AI', read: false },
    ];
  }
}

export class ActivityService {
  static async logActivity(userId: string, eventName: string, metadata: any): Promise<void> {
    await Logger.info(`Telemetry Ingestion: ${eventName}`, { userId, ...metadata });
  }
}
