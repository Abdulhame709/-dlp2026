import { ISettingsRepository } from './settings-repository-interface';
import { UserSettingsProfile } from './settings-types';
import { DependencyInjector } from '@/core/config/dependency-injector';
import { EventBus } from '@/core/utils/event-bus';

export class SettingsService {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): ISettingsRepository {
    return DependencyInjector.getSettingsRepository();
  }

  static async getUserSettings(userId: string): Promise<UserSettingsProfile> {
    return this.repository.getSettings(userId);
  }

  static async updateSettings(userId: string, settings: Partial<UserSettingsProfile>): Promise<UserSettingsProfile> {
    const updated = await this.repository.saveSettings(userId, settings);
    
    // Broadcast event to notify other modules (e.g. updating locale in client, or modifying AI coach preferences)
    await EventBus.publish('FEATURE_USED', {
      userId,
      featureName: 'settings_updated',
      metadata: { settingsChanged: Object.keys(settings) },
    });

    return updated;
  }
}
export type { ISettingsRepository };
