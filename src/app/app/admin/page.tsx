'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Building, Users, BrainCircuit, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { createClient } from '@/core/database/connection';
import { useLocale } from '@/shared/hooks/use-locale';

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  details: string;
  time: string;
}

export default function AdminPage() {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = React.useState(true);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);
  const [stats, setStats] = React.useState({
    activeUsers: 0,
    organizations: 0,
    aiRequests: 0,
  });

  React.useEffect(() => {
    async function loadAdminData() {
      try {
        const supabase = await createClient();

        // Fetch real audit logs from database
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (logs && logs.length > 0) {
          setAuditLogs(logs.map((log: any) => ({
            id: log.id,
            action: log.action || 'Unknown action',
            actor: log.actor_email || log.user_id || 'Unknown',
            details: log.details || '',
            time: new Date(log.created_at).toLocaleString(),
          })));
        }

        // Fetch real stats from database
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: orgCount } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });

        const { count: activityCount } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeUsers: userCount || 0,
          organizations: orgCount || 0,
          aiRequests: activityCount || 0,
        });
      } catch (err) {
        console.error('Failed to load admin data:', err);
        // Fallback to empty state — no hardcoded data
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const displayStats = [
    { name: t('admin.activeUsers'), count: stats.activeUsers.toLocaleString(), change: t('admin.live'), icon: Users, color: 'text-primary' },
    { name: t('admin.organizations'), count: stats.organizations.toLocaleString(), change: t('admin.live'), icon: Building, color: 'text-accent' },
    { name: t('admin.aiRequests'), count: stats.aiRequests.toLocaleString(), change: t('admin.live'), icon: BrainCircuit, color: 'text-secondary' },
    { name: t('admin.systemHealth'), count: t('admin.activeStatus'), change: t('admin.operational'), icon: HeartPulse, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.title')}</h1>
        <p className="text-xs text-muted-foreground font-arabic">{t('admin.desc')}</p>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-0 border-none">
                <span className="text-xs font-semibold text-muted-foreground uppercase">{stat.name}</span>
                <Icon className={cn('h-5 w-5 shrink-0', stat.color)} />
              </CardHeader>
              <CardContent className="p-0 pt-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-foreground">{stat.count}</span>
                    <p className="text-[10px] text-secondary font-bold flex items-center">
                      <Activity className="h-3 w-3 mr-1" /> {stat.change}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Audit Logs Table Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-border flex flex-row items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-error" /> {t('admin.auditLog')}
            </span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading ? (
              <div className="space-y-3 pt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {t('admin.noLogs')}
              </div>
            ) : (
              auditLogs.map(audit => (
                <div key={audit.id} className="py-3 flex justify-between text-xs font-semibold">
                  <div className="space-y-1">
                    <p className="text-foreground">{audit.action}</p>
                    <p className="text-[10px] text-muted-foreground">Actor: {audit.actor}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{audit.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Resource & Token Monitor */}
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-border">
            <span className="text-sm font-bold">{t('admin.aiQuota')}</span>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground select-none">
                <span>{t('admin.monthlyBudget')}</span>
                <span>0% {t('admin.used')}</span>
              </div>
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden border border-border">
                <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t('admin.aiGatewayDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
