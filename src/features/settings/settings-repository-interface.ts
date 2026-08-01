import { UserSettingsProfile } from './settings-types';

export interface ISettingsRepository {
  getSettings(userId: string): Promise<UserSettingsProfile>;
  saveSettings(userId: string, settings: Partial<UserSettingsProfile>): Promise<UserSettingsProfile>;
}
