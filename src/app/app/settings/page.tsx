'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { SettingsService } from '@/features/settings/settings-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { UserSettingsProfile } from '@/features/settings/settings-types';
import { Settings, Shield, User, Bell, Database, Key, Sparkles, Loader2, Lock, Smartphone, Mail, Eye, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { t, locale, dir } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [settings, setSettings] = React.useState<UserSettingsProfile | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<'personal' | 'security' | 'notifications' | 'dataExport'>('personal');

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
        language: locale,
        timezone: settings?.timezone || 'Asia/Aden',
        theme: settings?.theme || 'dark',
        dateFormat: settings?.dateFormat || 'YYYY-MM-DD',
        timeFormat: settings?.timeFormat || '12H',
        marketingEmails: settings?.marketingEmails ?? false,
        securityEmails: settings?.securityEmails ?? true,
        pushNotifications: settings?.pushNotifications ?? true,
        aiCoachingTips: settings?.aiCoachingTips ?? true,
        aiResponseIntensity: settings?.aiResponseIntensity || 'balanced',
        privacyAnonymizeData: settings?.privacyAnonymizeData ?? false,
        privacyShareAnalytics: settings?.privacyShareAnalytics ?? false,
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
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-full justify-start h-10 text-xs", { "bg-primary/10 text-primary font-bold": activeSection === 'personal' })}
            onClick={() => setActiveSection('personal')}
          >
            <User className="h-4 w-4 mr-2" /> {t('settings.personalInfo')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-full justify-start h-10 text-xs", { "bg-primary/10 text-primary font-bold": activeSection === 'security' })}
            onClick={() => setActiveSection('security')}
          >
            <Shield className="h-4 w-4 mr-2" /> {t('settings.security')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-full justify-start h-10 text-xs", { "bg-primary/10 text-primary font-bold": activeSection === 'notifications' })}
            onClick={() => setActiveSection('notifications')}
          >
            <Bell className="h-4 w-4 mr-2" /> {t('settings.notifications')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-full justify-start h-10 text-xs", { "bg-primary/10 text-primary font-bold": activeSection === 'dataExport' })}
            onClick={() => setActiveSection('dataExport')}
          >
            <Database className="h-4 w-4 mr-2" /> {t('settings.dataExport')}
          </Button>
        </div>

        {/* Configurations content wrapper */}
        <div className="md:col-span-3 space-y-6">
          {activeSection === 'personal' && (
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
          )}

          {activeSection === 'security' && (
          <Card className="p-6 border border-border bg-card rounded-xl space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Shield className="h-4 w-4 text-primary" /> {t('settings.securitySection')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.changePassword')}</span>
                    <span className="text-[10px] text-muted-foreground">Update your account password</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => window.location.href = '/forgot-password'}>
                  {t('settings.changePassword')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.twoFactorAuth')}</span>
                    <span className="text-[10px] text-muted-foreground">Add an extra layer of security</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                  {t('common.comingSoon') || 'Coming Soon'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.activeSessions')}</span>
                    <span className="text-[10px] text-muted-foreground">Manage your active login sessions</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                  {t('common.comingSoon') || 'Coming Soon'}
                </Button>
              </div>
            </div>
          </Card>
          )}

          {activeSection === 'notifications' && (
          <Card className="p-6 border border-border bg-card rounded-xl space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Bell className="h-4 w-4 text-primary" /> {t('settings.notificationsSection')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.emailNotifications')}</span>
                    <span className="text-[10px] text-muted-foreground">Receive email updates about your account</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.marketingEmails ?? true}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, marketingEmails: e.target.checked } : prev)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.pushNotifications')}</span>
                    <span className="text-[10px] text-muted-foreground">Get browser push notifications</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.pushNotifications ?? true}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, pushNotifications: e.target.checked } : prev)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.aiCoachingTips')}</span>
                    <span className="text-[10px] text-muted-foreground">Receive AI productivity coaching tips</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.aiCoachingTips ?? true}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, aiCoachingTips: e.target.checked } : prev)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
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
          )}

          {activeSection === 'dataExport' && (
          <Card className="p-6 border border-border bg-card rounded-xl space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
              <Database className="h-4 w-4 text-primary" /> {t('settings.dataExportSection')}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.exportData')}</span>
                    <span className="text-[10px] text-muted-foreground">Download all your data in JSON format</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                  {t('common.comingSoon') || 'Coming Soon'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.privacySettings')}</span>
                    <span className="text-[10px] text-muted-foreground">Control how your data is used</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.privacyShareAnalytics ?? false}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, privacyShareAnalytics: e.target.checked } : prev)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-error/5 border border-error/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-error" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t('settings.deleteAccount')}</span>
                    <span className="text-[10px] text-muted-foreground">Permanently delete your account and all data</span>
                  </div>
                </div>
                <Button variant="danger" size="sm" className="h-8 text-xs" disabled>
                  {t('settings.deleteAccount')}
                </Button>
              </div>
            </div>
          </Card>
          )}

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
