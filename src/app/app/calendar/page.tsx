'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, Clock, MapPin } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Calendar Schedule
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">التقويم والجدولة الذكية وإدارة مواعيد العمل الحيوية</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Day</Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs bg-card font-bold shadow-sm">Week</Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Month</Button>
          </div>
          <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer">
            <Plus className="h-4 w-4 mr-2" /> Schedule Event
          </Button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Calendar Side helper and events */}
        <div className="space-y-6">
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-primary">
              <Sparkles className="h-4 w-4 animate-pulse" /> Focus Block Guard
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              AI has locked your morning slot (09:00 - 12:00) as **Deep Work**. All notifications and meeting invites are automatically auto-responded during this slot.
            </p>
          </Card>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Schedule</h4>
            <div className="space-y-2">
              <div className="p-3 bg-card border border-border rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">Deep Work Sprint</span>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">09:00 AM</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> 3 Hours | <MapPin className="h-3.5 w-3.5" /> Silent Mode
                </div>
              </div>

              <div className="p-3 bg-card border border-border rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">Main Sync Session</span>
                  <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded">02:30 PM</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> 45 Mins | <MapPin className="h-3.5 w-3.5" /> Google Meet
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly grid display panel (Placeholder) */}
        <div className="lg:col-span-3 border border-border bg-card rounded-xl p-6 h-[650px] flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <span className="text-sm font-bold">July 2026</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-7 gap-2 pt-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">{day}</span>
                <div className="mt-2 h-[480px] bg-muted/20 border border-dashed border-border rounded-lg p-2 space-y-2">
                  <span className="block text-[10px] font-bold text-left text-muted-foreground/65">28</span>
                  {day === 'Tue' && (
                    <div className="p-1.5 bg-primary/10 border border-primary/20 text-primary text-[9px] rounded font-bold text-left leading-normal">
                      Focus Block (09:00 - 12:00)
                    </div>
                  )}
                  {day === 'Wed' && (
                    <div className="p-1.5 bg-accent/10 border border-accent/20 text-accent text-[9px] rounded font-bold text-left leading-normal">
                      PR Review (14:30)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
