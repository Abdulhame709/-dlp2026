'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { Bell, Check, Sparkles, AlertTriangle, Clock, X } from 'lucide-react';

export default function NotificationsPage() {
  const [userId, setUserId] = React.useState('11111111-1111-1111-1111-111111111111');
  const [unreadCount, setUnreadCount] = React.useState(3);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside notifications page:', err);
      }
    }
    loadUser();
  }, []);

  const alerts = [
    { id: '1', title: 'Task priority escalated by AI', desc: 'The task "Setup Authentication Pages" has been upgraded to CRITICAL because of the Sep Sep deadline constraint.', time: '5 mins ago', type: 'AI' },
    { id: '2', title: 'Daily AI Review is ready', desc: 'Your morning productivity summary and team focus blocks are calculated.', time: '1 hour ago', type: 'COACH' },
    { id: '3', title: 'New workspace organization initialized', desc: 'Cortex Founders Inc. organization has been initialized with default feature flags.', time: '2 hours ago', type: 'SYSTEM' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications & Alerts
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">سجل التنبيهات وإشعارات المساعد الذكي والأمان</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="h-10 text-xs" onClick={() => setUnreadCount(0)}>
            <Check className="h-4 w-4 mr-2" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {unreadCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
            <Bell className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-bold">You are all caught up!</h3>
            <p className="text-xs text-muted-foreground mt-1">There are no unread notifications or alerts in your inbox.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="p-5 border border-border bg-card rounded-xl space-y-3 hover:border-primary/20 transition-all relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    {alert.type === 'AI' ? <Sparkles className="h-4.5 w-4.5 animate-bounce" /> : <Bell className="h-4.5 w-4.5" />}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground block">{alert.title}</span>
                    <p className="text-xs text-muted-foreground leading-normal">{alert.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {alert.time}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
