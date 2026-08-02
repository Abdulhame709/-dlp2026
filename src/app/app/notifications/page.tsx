'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { NotificationService } from '@/features/notifications/notification-service';
import { NotificationItem } from '@/features/notifications/notification-types';
import { useLocale } from '@/shared/hooks/use-locale';
import { Bell, Check, Sparkles, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          // Load real notifications from service
          const notifs = await NotificationService.getNotifications(user.id);
          setNotifications(notifs);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside notifications page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!userId) return;
    // Mark each unread notification as read
    for (const notif of notifications.filter(n => !n.isRead)) {
      await NotificationService.markAsRead(notif.id);
    }
    // Refresh the list
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (notifId: string) => {
    await NotificationService.markAsRead(notifId);
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> {t('notifications.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">{t('notifications.desc')}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="h-10 text-xs" onClick={handleMarkAllRead}>
            <Check className="h-4 w-4 mr-2" /> {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
            <p className="text-xs text-muted-foreground">{t('notifications.loadingNotifications')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
            <Bell className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-bold">{t('notifications.noNotifications')}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t('notifications.noNotificationsDesc')}</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-5 border border-border bg-card rounded-xl space-y-3 hover:border-primary/20 transition-all relative ${
                !notif.isRead ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    {notif.type === 'AI_SUGGESTION' ? <Sparkles className="h-4.5 w-4.5 animate-bounce" /> : <Bell className="h-4.5 w-4.5" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">{notif.title}</span>
                    <p className="text-xs text-muted-foreground leading-normal">{notif.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => handleMarkRead(notif.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
