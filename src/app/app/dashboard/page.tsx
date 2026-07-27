'use client';

import * as React from 'react';
import { Widget } from '@/shared/components/dashboard/widget';
import { Button } from '@/shared/components/ui/button';
import { 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Zap, 
  BrainCircuit, 
  Clock,
  Flame
} from 'lucide-react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial workspace telemetry load
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Message Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border border-border bg-card rounded-xl shadow-sm select-none">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Good morning, Abdul <Sparkles className="h-5 w-5 text-warning animate-bounce" />
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your highest priority task today is: <strong className="text-primary font-semibold">"Deploy Database Schema with RLS"</strong>.
          </p>
        </div>
        <div>
          <Button variant="primary" className="h-9 text-xs">
            <Plus className="h-4 w-4 mr-1.5" /> New Task
          </Button>
        </div>
      </div>

      {/* Primary Widget Grid Layout */}
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
                <span className="text-xs font-medium text-foreground">Deploy Database Schema with RLS</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" className="h-4 w-4 text-primary rounded" />
                <span className="text-xs font-medium text-foreground">Setup Authentication Pages</span>
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
              <span className="text-4xl font-extrabold text-primary">87%</span>
              <p className="text-xs font-semibold text-secondary flex items-center justify-center gap-1">
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
    </div>
  );
}
