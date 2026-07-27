import { Logger } from '../logging/logger';

export class ProjectService {
  static async createProject(userId: string, orgId: string | null, name: string): Promise<any> {
    await Logger.info('Project Created', { userId, orgId, name });
    return { id: `project-mock-${Date.now()}`, name, ownerId: userId, organizationId: orgId };
  }

  static async getProjects(userId: string): Promise<any[]> {
    return [
      { id: '44444444-4444-4444-4444-444444444444', name: 'Cortex Platform Launch', ownerId: userId },
    ];
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
