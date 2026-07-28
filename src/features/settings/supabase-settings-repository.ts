import { ISettingsRepository } from './settings-repository-interface';
import { UserSettingsProfile } from './settings-types';
import { createClient } from '@/core/database/server';

export class SupabaseSettingsRepository implements ISettingsRepository {
  private mapRowToEntity(profileRow: any): UserSettingsProfile {
    const preferences = profileRow.preferences || {};
    return {
      id: profileRow.id,
      fullName: profileRow.full_name,
      avatarUrl: profileRow.avatar_url,
      timezone: profileRow.timezone,
      language: profileRow.language,
      theme: (preferences.theme_preference as 'light' | 'dark' | 'system') || 'dark',
      dateFormat: preferences.date_format || 'YYYY-MM-DD',
      timeFormat: preferences.time_format || 'HH:mm',
      marketingEmails: preferences.marketing_emails || false,
      securityEmails: preferences.security_emails || true,
      pushNotifications: preferences.push_notifications || true,
      aiCoachingTips: preferences.ai_coaching_tips || true,
      aiResponseIntensity: preferences.ai_response_intensity || 'balanced',
      privacyAnonymizeData: preferences.privacy_anonymize_data || true,
      privacyShareAnalytics: preferences.privacy_share_analytics || false,
    };
  }

  async getSettings(userId: string): Promise<UserSettingsProfile> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      throw new Error(`SETTINGS_QUERY_FAILED: ${error?.message || 'Record not found'}`);
    }

    return this.mapRowToEntity(data);
  }

  async saveSettings(userId: string, settings: Partial<UserSettingsProfile>): Promise<UserSettingsProfile> {
    const supabase = await createClient();

    const currentSettings = await this.getSettings(userId);
    const merged = { ...currentSettings, ...settings };

    const preferences = {
      theme_preference: merged.theme,
      date_format: merged.dateFormat,
      time_format: merged.timeFormat,
      marketing_emails: merged.marketingEmails,
      security_emails: merged.securityEmails,
      push_notifications: merged.pushNotifications,
      ai_coaching_tips: merged.aiCoachingTips,
      ai_response_intensity: merged.aiResponseIntensity,
      privacy_anonymize_data: merged.privacyAnonymizeData,
      privacy_share_analytics: merged.privacyShareAnalytics,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: merged.fullName,
        avatar_url: merged.avatarUrl || null,
        timezone: merged.timezone,
        language: merged.language,
        preferences,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`SETTINGS_UPDATE_FAILED: ${error?.message || 'Update empty response'}`);
    }

    return this.mapRowToEntity(data);
  }
}
export type { ISettingsRepository };
