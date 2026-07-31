'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/shared/hooks/use-theme';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { AuthService } from '@/core/auth/auth-service';
import { createClient } from '@/core/database/connection';
import { Sun, Moon, Bell, Search, Building, Languages, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export function TopNav() {
  const pathname = usePathname();
  const { toggleTheme, theme } = useTheme();
  const { activeWorkspaceId, setActiveWorkspaceId } = useLayoutStore();

  const [lang, setLang] = React.useState('en');
  const [updatingLang, setUpdatingLang] = React.useState(false);

  // Load language preference on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setLang(localStorage.getItem('language') || 'en');
    }
  }, []);

  // Handle Dynamic Language Switch (with Database Sync & full RTL/LTR document flip)
  const handleLanguageSwitch = async () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setUpdatingLang(true);
    
    try {
      // 1. Persist locally
      localStorage.setItem('language', nextLang);
      setLang(nextLang);

      // 2. Apply direction and locale to HTML root node
      const html = document.documentElement;
      html.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
      html.lang = nextLang;

      // 3. Persist to database profile in live mode
      const user = await AuthService.getCurrentUser();
      if (user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock-')) {
        const supabase = await createClient();
        await supabase
          .from('profiles')
          .update({ language: nextLang })
          .eq('id', user.id);
      }

      // 4. Force window reload to synchronize layout states globally
      window.location.reload();
    } catch (err) {
      console.error('Failed to sync language preference to database:', err);
    } finally {
      setUpdatingLang(false);
    }
  };

  // Create clean breadcrumbs from path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.length > 1 ? pathSegments[1] : 'Dashboard';
  const capitalizedBreadcrumb = breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1);

  // Mock Workspace data list
  const workspaces = [
    { id: '22222222-2222-2222-2222-222222222222', name: 'Cortex Founders Inc.' },
    { id: 'personal-org-uuid-mock-1234', name: 'Personal Workspace' },
  ];

  const activeWorkspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Default Space';

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 text-foreground shadow-sm">
      {/* Left Area: Breadcrumbs & Path Metadata */}
      <div className="flex items-center space-x-3 select-none">
        <span className="text-sm font-medium text-muted-foreground">App</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-semibold text-foreground tracking-tight">
          {capitalizedBreadcrumb}
        </span>
      </div>

      {/* Middle Area: Mock Search Bar */}
      <div className="hidden md:flex w-96 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects, tasks, goals... (Press ⌘K)"
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-muted/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          disabled
        />
      </div>

      {/* Right Area: Workspace Switcher, Toggles, Notifications & Profile Menu */}
      <div className="flex items-center space-x-4">
        {/* Workspace Switcher Dropdown */}
        <div className="relative flex items-center border border-border rounded-lg bg-muted/40 h-9 px-3 text-xs font-semibold cursor-pointer select-none">
          <Building className="h-4 w-4 text-primary mr-1.5 shrink-0" />
          <select
            value={activeWorkspaceId}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            className="bg-transparent border-none outline-none text-foreground cursor-pointer focus:ring-0"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic i18n Language Switcher */}
        <button
          onClick={handleLanguageSwitch}
          disabled={updatingLang}
          className="flex h-9 px-3 items-center justify-center rounded-lg border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors gap-1.5"
          aria-label="Switch Language"
        >
          {updatingLang ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Languages className="h-4 w-4" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </>
          )}
        </button>

        {/* Theme Light/Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
          </button>
        </div>

        {/* User Profile Menu Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center select-none">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
