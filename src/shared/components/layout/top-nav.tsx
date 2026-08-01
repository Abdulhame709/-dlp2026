'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/shared/hooks/use-theme';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { AuthService } from '@/core/auth/auth-service';
import { createClient } from '@/core/database/connection';
import { Sun, Moon, Bell, Search, Building, Languages, Loader2, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useLocale } from '@/shared/hooks/use-locale';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme, theme } = useTheme();
  const { activeWorkspaceId, setActiveWorkspaceId } = useLayoutStore();
  const { t } = useLocale();

  const [lang, setLang] = React.useState('en');
  const [updatingLang, setUpdatingLang] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');

  // Load language preference on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setLang(localStorage.getItem('language') || 'en');
    }
  }, []);

  // Load user profile data on mount
  React.useEffect(() => {
    async function loadUserProfile() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserName(user.fullName || '');
          setUserEmail(user.email || '');
        }
      } catch {
        // User not logged in — ignore
      }
    }
    loadUserProfile();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Force redirect even if logout fails
    }
    setShowProfileMenu(false);
    router.push('/login');
  };

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

  // Dynamic workspace list loaded from OrganizationService
  const [workspaces, setWorkspaces] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    async function loadWorkspaces() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          const { OrganizationService } = await import('@/features/organizations/organization-service');
          const orgs = await OrganizationService.getUserOrganizations(user.id);
          const mapped = orgs.map((org: any) => ({ id: org.id, name: org.name }));
          setWorkspaces(mapped);
          // Set first org as active if none selected
          if (mapped.length > 0 && !activeWorkspaceId) {
            setActiveWorkspaceId(mapped[0].id);
          }
        }
      } catch {
        // Fallback to empty list — workspace switcher will show empty state
      }
    }
    loadWorkspaces();
  }, [activeWorkspaceId, setActiveWorkspaceId]);

  const activeWorkspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name || t('organizations.title');

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
          placeholder={t('common.search')}
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
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center select-none">
              {userName ? userName.charAt(0).toUpperCase() : 'A'}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 bg-card border border-border rounded-xl shadow-lg py-2 select-none animate-fade-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-bold text-foreground truncate">{userName || 'Cortex User'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                </div>
                {/* Menu items */}
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="h-4 w-4 text-muted-foreground" /> {t('settings.title')}
                </Link>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-error hover:bg-error/10 transition-colors cursor-pointer w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> {t('common.signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
