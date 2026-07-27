'use client';

import * as React from 'react';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { Sidebar } from '@/shared/components/layout/sidebar';
import { TopNav } from '@/shared/components/layout/top-nav';
import { ErrorBoundary } from '@/shared/components/layout/error-boundary';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSidebarCollapsed } = useLayoutStore();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-150">
        {/* Left Side: Collapsible Sidebar Menu */}
        <Sidebar />

        {/* Right Side Content Container */}
        <div
          className={cn('flex flex-col min-h-screen transition-all duration-300', {
            'pl-64': !isSidebarCollapsed,
            'pl-16': isSidebarCollapsed,
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
