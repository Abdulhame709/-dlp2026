export interface UserSettingsProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  timeFormat: string;
  marketingEmails: boolean;
  securityEmails: boolean;
  pushNotifications: boolean;
  aiCoachingTips: boolean;
  aiResponseIntensity: 'conservative' | 'balanced' | 'creative';
  privacyAnonymizeData: boolean;
  privacyShareAnalytics: boolean;
}
