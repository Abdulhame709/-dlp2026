'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Folder, Plus, Sparkles, LayoutGrid, ListFilter, Calendar } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" /> Projects Workspace
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">المشاريع ومساحات العمل التشاركية للفرق</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs">
            <ListFilter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer">
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project A */}
        <Card className="p-6 border border-border bg-card rounded-xl space-y-4 hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Folder className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">Cortex AI Portal</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Main portal development, including dashboard components, AI widgets, and RLS integration.
            </p>
          </div>
          <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground border-t border-border/40">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Due Aug 15
            </span>
            <span className="font-semibold text-primary">85% Progress</span>
          </div>
        </Card>

        {/* Project B */}
        <Card className="p-6 border border-border bg-card rounded-xl space-y-4 hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Folder className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase">
              Staging
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">Mobile App PWA</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Configuring service workers, responsive layouts, and IndexedDB sync capabilities.
            </p>
          </div>
          <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground border-t border-border/40">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Due Sep 10
            </span>
            <span className="font-semibold text-accent">45% Progress</span>
          </div>
        </Card>

        {/* Dynamic Project Assistant helper Card */}
        <Card className="p-6 border border-primary/20 bg-primary/5 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 animate-pulse" /> AI Project Coach
            </div>
            <h3 className="text-sm font-bold">Adaptive Scheduling Active</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
               C-Cortex AI has examined your active project dependencies and protected focus blocks. All schedules are automatically optimized based on your team patterns.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full h-8 text-[11px] hover:bg-primary hover:text-primary-foreground border-primary/20">
            Ask for Breakdown steps
          </Button>
        </Card>
      </div>
    </div>
  );
}
