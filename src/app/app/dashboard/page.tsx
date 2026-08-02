'use client';

import * as React from 'react';
import { Widget } from '@/shared/components/dashboard/widget';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { AIAssistantService } from '@/features/ai/core/AIAssistantService';
import { AuthService } from '@/core/auth/auth-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Zap, 
  BrainCircuit, 
  Clock,
  Flame,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string>('11111111-1111-1111-1111-111111111111');
  const [isLoading, setIsLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [coachAdvice, setCoachAdvice] = React.useState<any>(null);

  // Load current user details on mount to resolve session dynamically
  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session during dashboard mount:', err);
      }
    }
    loadUser();
  }, []);

  // Load analytics and AI coach data dynamically based on the resolved user ID
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const resolvedMetrics = await AnalyticsService.getMetrics(userId);
      const resolvedCoach = await AIAssistantService.getCoachingAdvice(userId);
      
      setMetrics(resolvedMetrics);
      setCoachAdvice(resolvedCoach);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ========================================== */}
      {/* 1. DAILY AI REVIEW BANNER (SaaS Upgrade)   */}
      {/* ========================================== */}
      <div className="p-6 border border-primary/20 bg-primary/5 rounded-xl shadow-sm space-y-4 select-none animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" /> {t('dashboard.aiReviewTitle')}
            </h1>
            <p className="text-xs text-muted-foreground font-arabic">{t('dashboard.aiReviewDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 bg-secondary/15 text-secondary rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> {metrics?.executionHealth || t('dashboard.executionHealth')}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.completedYesterday')}</span>
              <span className="text-base font-black text-secondary block">{metrics?.totalTasksCompleted || 0} Tasks</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.pendingInbox')}</span>
              <span className="text-base font-black text-primary block">{metrics?.totalTasksCreated || 0} Tasks</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.atRiskOverdue')}</span>
              <span className="text-base font-black text-error block">{metrics?.overdueTasksCount || 0} Task</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.suggestedFocus')}</span>
              <span className="text-base font-black text-accent block">{metrics?.focusTime || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 2. PRIMARY WIDGET GRID LAYOUT             */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Widget 1: Today's Focus */}
        <Widget
          title={t('dashboard.todayFocus')}
          icon={CheckCircle}
          isLoading={isLoading}
          actions={
            <Button variant="ghost" className="h-6 px-1.5 text-[10px]">
              {t('dashboard.viewAll')}
            </Button>
          }
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {(metrics?.todayFocusItems || []).length > 0 ? (
                (metrics?.todayFocusItems || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2.5">
                    <input type="checkbox" className="h-4 w-4 text-primary rounded" defaultChecked={item.done} />
                    <span className={cn('text-xs', item.done ? 'text-muted-foreground line-through' : 'font-semibold text-foreground')}>{item.title}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <CheckCircle className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">{t('common.emptyState')}</p>
                </div>
              )}
            </div>
            {metrics?.todayFocusItems && metrics.todayFocusItems.length > 0 && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{t('dashboard.progressLabel')} {metrics?.focusProgress || 0}%</span>
                <span className="font-semibold text-primary">{t('dashboard.tasksDone', { done: metrics?.focusDone || 0, total: metrics?.focusTotal || 0 })}</span>
              </div>
            )}
          </div>
        </Widget>

        {/* Widget 2: AI Daily Plan */}
        <Widget
          title={t('dashboard.aiDailyPlan')}
          icon={BrainCircuit}
          isLoading={isLoading}
        >
          <div className="space-y-3 flex-1 flex flex-col justify-between select-none">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-primary">{t('dashboard.morningSlot')}</span>
                <span className="text-muted-foreground">{metrics?.morningSlot || '09:00 - 11:00'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-accent">{t('dashboard.afternoonSlot')}</span>
                <span className="text-muted-foreground">{metrics?.afternoonSlot || '13:00 - 15:00'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-secondary">{t('dashboard.eveningSlot')}</span>
                <span className="text-muted-foreground">{metrics?.eveningSlot || '17:00 - 18:30'}</span>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 mt-2">
              <Clock className="h-3 w-3" /> {t('dashboard.timezoneNote')}
            </p>
          </div>
        </Widget>

        {/* Widget 3: Productivity Analytics */}
        <Widget
          title={t('dashboard.productivityScore')}
          icon={TrendingUp}
          isLoading={isLoading}
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between text-center select-none">
            <div className="space-y-1.5 pt-2">
              <span className="text-4xl font-extrabold text-primary">{metrics?.productivityScore || 0}%</span>
              <p className="text-xs font-bold text-secondary flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5" /> {t('dashboard.energyBlock')}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t('dashboard.behaviorInsight')}
            </p>
          </div>
        </Widget>

        {/* Widget 4: Habit Tracker */}
        <Widget
          title={t('dashboard.habitStreaks')}
          icon={Flame}
          isLoading={isLoading}
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between select-none">
            <div className="space-y-2.5">
              {(metrics?.habitStreaks || []).length > 0 ? (
                (metrics?.habitStreaks || []).map((habit: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{habit.name}</span>
                    <span className={cn('font-semibold flex items-center', habit.streak > 0 ? 'text-warning' : 'text-muted-foreground')}>
                      {habit.streak > 0 && <Flame className="h-3.5 w-3.5 fill-current mr-0.5" />} {habit.streak} days
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Flame className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">{t('common.emptyState')}</p>
                </div>
              )}
            </div>
            {(metrics?.habitStreaks || []).length > 0 && (
              <div className="pt-2 border-t border-border flex justify-center">
                <Button variant="outline" className="h-7 px-2.5 text-[10px]">
                  {t('dashboard.completeAllHabits')}
                </Button>
              </div>
            )}
          </div>
        </Widget>

      </div>

      {/* ========================================== */}
      {/* 3. AI EXECUTION COACH PANEL (SaaS Polish)  */}
      {/* ========================================== */}
      {coachAdvice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coaching Advice Text (2 cols) */}
          <Card className="lg:col-span-2 p-6 space-y-4 shadow-sm select-none">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <span className="text-sm font-bold flex items-center gap-1.5 text-secondary">
                <Award className="h-5 w-5 text-secondary animate-pulse" /> {t('dashboard.coachAdviceTitle')}
              </span>
            </div>
            
            <div className="space-y-3 leading-relaxed text-xs">
              <p className="text-foreground p-4 bg-muted/40 rounded-xl border border-border leading-normal">
                {coachAdvice.coachingAdvice}
              </p>
            </div>
          </Card>

          {/* Recommended Actions Bullet points (1 col) */}
          <Card className="p-6 space-y-4 shadow-sm select-none">
            <div className="border-b border-border pb-3.5 flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-1.5 text-primary">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> {t('dashboard.nextActionsTitle')}
              </span>
            </div>

            <div className="space-y-3">
              {coachAdvice.recommendedActions.map((action: string, idx: number) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border rounded-xl flex items-start space-x-2.5">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-[11px] font-semibold text-foreground leading-normal">{action}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}
