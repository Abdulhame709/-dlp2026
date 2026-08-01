'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { SettingsService } from '@/features/settings/settings-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { UserSettingsProfile } from '@/features/settings/settings-types';
import { Settings, Shield, User, Bell, Database, Key, Sparkles, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { t, locale, dir } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [settings, setSettings] = React.useState<UserSettingsProfile | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          setFullName(user.fullName || 'User');
          setEmail(user.email || '');

          const userSettings = await SettingsService.getUserSettings(user.id);
          setSettings(userSettings);
          if (userSettings.fullName) setFullName(userSettings.fullName);
        }
      } catch (err) {
        console.error('Failed to load current user inside settings page:', err);
      }
    }
    loadUser();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await SettingsService.updateSettings(userId, {
        fullName,
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div dir={dir} className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> {t('settings.title')}
        </h1>
        <p className="text-sm text-muted-foreground font-arabic mt-1">{t('settings.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Panel */}
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs bg-primary/10 text-primary font-bold">
            <User className="h-4 w-4 mr-2" /> {t('settings.personalInfo')}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Shield className="h-4 w-4 mr-2" /> {t('settings.security')}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Bell className="h-4 w-4 mr-2" /> {t('settings.notifications')}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Database className="h-4 w-4 mr-2" /> {t('settings.dataExport')}
          </Button>
        </div>

        {/* Configurations content wrapper */}
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6 border border-border bg-card rounded-xl space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
                <User className="h-4 w-4 text-primary" /> {t('settings.personalInfo')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{t('settings.fullName')}</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{t('settings.emailAddress')}</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center font-medium">
                    {email}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Sparkles className="h-4 w-4 text-primary" /> {t('settings.localization')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{t('settings.primaryLanguage')}</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center justify-between">
                    <span>{locale === 'ar' ? 'العربية (Cairo Arabic)' : 'English (Inter Sans)'}</span>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{t('settings.regionalDialect')}</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center justify-between">
                    <span>{locale === 'ar' ? 'العربية (Cairo/Cairo)' : 'English (Inter/Jakarta)'}</span>
                    <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded uppercase font-arabic">{locale === 'ar' ? 'Cairo' : 'Inter'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button
                variant="primary"
                size="sm"
                className="h-10 text-xs cursor-pointer"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveSuccess ? `✓ ${t('settings.saved')}` : t('settings.savePreferences')}
              </Button>
            </div>
          </Card>

          {/* Security & Access notice */}
          <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-2">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-primary">
              <Key className="h-4 w-4" /> {t('settings.securityActive')}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t('settings.securityDesc')}
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
}
