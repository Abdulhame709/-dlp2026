import { ISettingsRepository } from './settings-repository-interface';
import { MockSettingsRepository } from './mock-settings-repository';
import { UserSettingsProfile } from './settings-types';
import { EventBus } from '@/core/utils/event-bus';

export class SettingsService {
  private static repository: ISettingsRepository = new MockSettingsRepository();

  static setRepository(customRepo: ISettingsRepository) {
    this.repository = customRepo;
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
