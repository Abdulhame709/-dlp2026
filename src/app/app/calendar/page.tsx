'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useLocale } from '@/shared/hooks/use-locale';
import { Calendar as CalendarIcon, Construction, Sparkles } from 'lucide-react';

export default function CalendarPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> {t('calendar.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">{t('calendar.desc')}</p>
        </div>
      </div>

      {/* Coming Soon placeholder */}
      <div className="flex flex-col items-center justify-center py-24 text-center select-none">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Construction className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t('calendar.comingSoon')}</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-lg leading-relaxed">
          {t('calendar.comingSoonDesc')}
        </p>
        <div className="flex items-center gap-2 mt-6">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">{t('calendar.aiPoweredScheduling')}</span>
        </div>
      </div>
    </div>
  );
}
