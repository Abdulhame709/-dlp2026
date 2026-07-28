'use client';

import * as React from 'react';
import { Widget } from '@/shared/components/dashboard/widget';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { AIAssistantService } from '@/features/ai/core/AIAssistantService';
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
  const demoUserId = '11111111-1111-1111-1111-111111111111';

  // State bindings
  const [isLoading, setIsLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [coachAdvice, setCoachAdvice] = React.useState<any>(null);

  // Load analytics and AI coach data on mount
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const resolvedMetrics = await AnalyticsService.getMetrics(demoUserId);
      const resolvedCoach = await AIAssistantService.getCoachingAdvice(demoUserId);
      
      setMetrics(resolvedMetrics);
      setCoachAdvice(resolvedCoach);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
              <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Daily AI Execution Review
            </h1>
            <p className="text-xs text-muted-foreground font-arabic">سجل التدقيق والمراجعة الصباحية التلقائية بالذكاء الاصطناعي</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 bg-secondary/15 text-secondary rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Execution Health: 94% (Stable)
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Completed Yesterday</span>
              <span className="text-base font-black text-secondary block">{metrics?.totalTasksCompleted || 4} Tasks</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending In Inbox</span>
              <span className="text-base font-black text-primary block">{metrics?.totalTasksCreated || 5} Tasks</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">At-Risk / Overdue</span>
              <span className="text-base font-black text-error block">{metrics?.overdueTasksCount || 1} Task</span>
            </div>
            <div className="p-3.5 bg-card border border-border rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Focus Suggested Time</span>
              <span className="text-base font-black text-accent block">09:00 - 11:00 AM</span>
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
          title="Today's Focus"
          arabicTitle="التركيز اليومي"
          icon={CheckCircle}
          isLoading={isLoading}
          actions={
            <Button variant="ghost" className="h-6 px-1.5 text-[10px]">
              View All
            </Button>
          }
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" className="h-4 w-4 text-primary rounded" defaultChecked />
                <span className="text-xs text-muted-foreground line-through">Initialize Project Structure</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" className="h-4 w-4 text-primary rounded" />
                <span className="text-xs font-semibold text-foreground">Deploy Database Schema with RLS</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" className="h-4 w-4 text-primary rounded" />
                <span className="text-xs font-semibold text-foreground">Setup Authentication Pages</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Progress: 33%</span>
              <span className="font-semibold text-primary">1 of 3 Done</span>
            </div>
          </div>
        </Widget>

        {/* Widget 2: AI Daily Plan */}
        <Widget
          title="AI Daily Plan"
          arabicTitle="خطة الذكاء الاصطناعي"
          icon={BrainCircuit}
          isLoading={isLoading}
        >
          <div className="space-y-3 flex-1 flex flex-col justify-between select-none">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-primary">Morning</span>
                <span className="text-muted-foreground">09:00 - 11:00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-accent">Afternoon</span>
                <span className="text-muted-foreground">13:00 - 15:00</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                <span className="font-semibold text-secondary">Evening</span>
                <span className="text-muted-foreground">17:00 - 18:30</span>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 mt-2">
              <Clock className="h-3 w-3" /> Auto-synchronized with Yemen timezone
            </p>
          </div>
        </Widget>

        {/* Widget 3: Productivity Analytics */}
        <Widget
          title="Productivity Score"
          arabicTitle="مؤشرات الإنتاجية"
          icon={TrendingUp}
          isLoading={isLoading}
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between text-center select-none">
            <div className="space-y-1.5 pt-2">
              <span className="text-4xl font-extrabold text-primary">{metrics?.productivityScore || 87}%</span>
              <p className="text-xs font-bold text-secondary flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5" /> High Energy Block
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              You complete complex tasks 1.4x faster before noon. Keep it up!
            </p>
          </div>
        </Widget>

        {/* Widget 4: Habit Tracker */}
        <Widget
          title="Habit Streaks"
          arabicTitle="العادات الصحية"
          icon={Flame}
          isLoading={isLoading}
        >
          <div className="space-y-3.5 flex-1 flex flex-col justify-between select-none">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Deep Work Sessions</span>
                <span className="font-semibold text-warning flex items-center">
                  <Flame className="h-3.5 w-3.5 fill-current mr-0.5" /> 5 days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Continuous Reading</span>
                <span className="font-semibold text-warning flex items-center">
                  <Flame className="h-3.5 w-3.5 fill-current mr-0.5" /> 18 days
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Hydration Check</span>
                <span className="font-semibold text-muted-foreground">0 days</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border flex justify-center">
              <Button variant="outline" className="h-7 px-2.5 text-[10px]">
                Complete All Habits
              </Button>
            </div>
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
                <Award className="h-5 w-5 text-secondary animate-pulse" /> AI Execution Coach Advice
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
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Next Best Actions
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
