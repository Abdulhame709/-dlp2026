'use client';

import * as React from 'react';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { Sidebar } from '@/shared/components/layout/sidebar';
import { TopNav } from '@/shared/components/layout/top-nav';
import { ErrorBoundary } from '@/shared/components/layout/error-boundary';
import { AnalyticsService } from '@/features/analytics/analytics-service';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSidebarCollapsed } = useLayoutStore();
  const [lang, setLang] = React.useState<string>('en');
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');

  // Initialize Analytics pipeline once on mount (registers EventBus subscribers)
  React.useEffect(() => {
    AnalyticsService.initialize();
  }, []);

  // Load language preference and apply RTL/LTR directions dynamically on mount
  React.useEffect(() => {
    function syncLanguage() {
      const activeLanguage = localStorage.getItem('language') || 'en';
      setLang(activeLanguage);
      setDir(activeLanguage === 'ar' ? 'rtl' : 'ltr');
      
      // Update HTML node direction for full document compliance
      const html = document.documentElement;
      html.dir = activeLanguage === 'ar' ? 'rtl' : 'ltr';
      html.lang = activeLanguage;
    }

    syncLanguage();

    // Listen to local storage changes to keep tabs synchronized
    window.addEventListener('storage', syncLanguage);
    return () => window.removeEventListener('storage', syncLanguage);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-150" dir={dir}>
        {/* Sidebar Menu - Anchored Left on LTR, Right on RTL */}
        <div className={cn("fixed top-0 bottom-0 z-20", dir === 'rtl' ? "right-0" : "left-0")}>
          <Sidebar />
        </div>

        {/* Content Container - Padded Left on LTR, Right on RTL */}
        <div
          className={cn('flex flex-col min-h-screen transition-all duration-300', {
            'pl-64': !isSidebarCollapsed && dir === 'ltr',
            'pl-16': isSidebarCollapsed && dir === 'ltr',
            'pr-64': !isSidebarCollapsed && dir === 'rtl',
            'pr-16': isSidebarCollapsed && dir === 'rtl',
          })}
        >
          {/* Header Bar */}
          <TopNav />

          {/* Main View Area */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
