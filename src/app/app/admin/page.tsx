'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Building, Users, BrainCircuit, Activity, ShieldAlert, HeartPulse } from 'lucide-react';

export default function AdminPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Seeded Admin statistics
  const stats = [
    { name: 'Active Users', count: '14,892', change: '+12.5%', icon: Users, color: 'text-primary' },
    { name: 'Organizations', count: '1,248', change: '+8.2%', icon: Building, color: 'text-accent' },
    { name: 'AI Requests', count: '452,903', change: '+35.6%', icon: BrainCircuit, color: 'text-secondary' },
    { name: 'System Health', count: '99.98%', change: 'Excellent', icon: HeartPulse, color: 'text-secondary' },
  ];

  const recentAudits = [
    { id: '1', action: 'User changed password', actor: 'demo@cortexai.local', time: '10 mins ago' },
    { id: '2', action: 'Task deleted (soft-delete)', actor: 'founder@cortexai.com', time: '45 mins ago' },
    { id: '3', action: 'Subscription upgraded to PRO', actor: 'user-b-2222', time: '2 hours ago' },
    { id: '4', action: 'Permission role updated (MEMBER ➔ ADMIN)', actor: 'owner-org-1', time: '5 hours ago' },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-xs text-muted-foreground font-arabic">لوحة التحكم والمراقبة المركزية للمشرفين</p>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
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
                      <Activity className="h-3 w-3 mr-1" /> {stat.change} this month
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
              <ShieldAlert className="h-4.5 w-4.5 text-error" /> SRE Security Audit Log
            </span>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading ? (
              <div className="space-y-3 pt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              recentAudits.map(audit => (
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
            <span className="text-sm font-bold">AI Quota & Token Ingestion</span>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-muted-foreground select-none">
                <span>Monthly Token Budget</span>
                <span>45% Used</span>
              </div>
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden border border-border">
                <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Unified AI Gateway is automatically distributing requests between OpenAI and lightweight fallback models to optimize budget costs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
