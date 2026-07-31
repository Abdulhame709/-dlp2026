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
  private static getRepo() {
    return DependencyInjector.getGoalRepository();
  }

  static async createGoal(userId: string, title: string, progress = 0, description = ''): Promise<any> {
    await Logger.info('Goal Created', { userId, title });
    return this.getRepo().createGoal(userId, { title, progress, description });
  }

  static async getGoals(userId: string): Promise<any[]> {
    return this.getRepo().getGoals(userId);
  }

  static async getGoalById(id: string): Promise<any | null> {
    return this.getRepo().getGoalById(id);
  }

  static async updateGoal(id: string, title: string, progress: number, description = '', status?: string): Promise<any | null> {
    return this.getRepo().updateGoal(id, { title, progress, description, status });
  }

  static async deleteGoal(id: string): Promise<boolean> {
    return this.getRepo().deleteGoal(id);
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
