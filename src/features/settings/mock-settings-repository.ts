import { UserSettingsProfile } from './settings-types';
import { ISettingsRepository } from './settings-repository-interface';

const mockSettingsTable = new Map<string, UserSettingsProfile>();

// Seed default settings matching our demo user
const defaultSettings: UserSettingsProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Abdul Demo User',
  timezone: 'Asia/Aden',
  language: 'ar',
  theme: 'dark',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  marketingEmails: false,
  securityEmails: true,
  pushNotifications: true,
  aiCoachingTips: true,
  aiResponseIntensity: 'balanced',
  privacyAnonymizeData: true,
  privacyShareAnalytics: false,
};

mockSettingsTable.set(defaultSettings.id, defaultSettings);

export class MockSettingsRepository implements ISettingsRepository {
  async getSettings(userId: string): Promise<UserSettingsProfile> {
    const existing = mockSettingsTable.get(userId);
    if (existing) return existing;

    const newSettings = { ...defaultSettings, id: userId };
    mockSettingsTable.set(userId, newSettings);
    return newSettings;
  }

  async saveSettings(userId: string, settings: Partial<UserSettingsProfile>): Promise<UserSettingsProfile> {
    const existing = await this.getSettings(userId);
    const updated = { ...existing, ...settings, id: userId };
    mockSettingsTable.set(userId, updated);
    return updated;
  }
}
export { mockSettingsTable };
