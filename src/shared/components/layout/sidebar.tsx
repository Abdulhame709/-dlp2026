'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { AuthService } from '@/core/auth/auth-service';
import { createClient } from '@/core/database/connection';
import { useLocale } from '@/shared/hooks/use-locale';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Folder, 
  Calendar, 
  BrainCircuit, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Building,
  Bell,
  CreditCard,
  MessageSquare,
  Shield
} from 'lucide-react';

interface SidebarItem {
  titleKey: string;
  path: string;
  icon: React.ComponentType<any>;
  allowedRoles?: string[];
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { titleKey: 'sidebar.dashboard', path: '/app/dashboard', icon: LayoutDashboard, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
  { titleKey: 'sidebar.tasks', path: '/app/tasks', icon: CheckSquare, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.projects', path: '/app/projects', icon: Folder, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.goals', path: '/app/goals', icon: Target, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.calendar', path: '/app/calendar', icon: Calendar, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
  { titleKey: 'sidebar.ai_assistant', path: '/app/ai-assistant', icon: BrainCircuit, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.organizations', path: '/app/organizations', icon: Building, allowedRoles: ['OWNER', 'ADMIN'] },
  { titleKey: 'sidebar.notifications', path: '/app/notifications', icon: Bell, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.billing', path: '/app/billing', icon: CreditCard, allowedRoles: ['OWNER'] },
  { titleKey: 'sidebar.feedback', path: '/app/feedback', icon: MessageSquare, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { titleKey: 'sidebar.settings', path: '/app/settings', icon: Settings, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
  { titleKey: 'sidebar.admin', path: '/app/admin', icon: Shield, allowedRoles: ['OWNER', 'ADMIN'], adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { locale, dir, t } = useLocale();
  const [role, setRole] = React.useState<string>('OWNER');
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Load active user role on mount
  React.useEffect(() => {
    setIsMounted(true);

    async function loadIdentityAndLayout() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          // Bypassing real database queries when running in local offline mock mode
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock-')) {
            setRole('OWNER');
            setIsAdmin(true);
            return;
          }

          const supabase = await createClient();
          const { data: membership } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (membership) {
            setRole(membership.role);
          }

          // Check admin status from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.is_admin) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Failed to load identity/role inside sidebar:', err);
      }
    }
    loadIdentityAndLayout();
  }, []);

  // Return safe skeleton container during SSR rendering to prevent hydration crashes
  if (!isMounted) {
    return (
      <aside className="fixed top-0 bottom-0 left-0 z-20 flex flex-col w-16 border-r border-border bg-card text-foreground select-none animate-pulse">
        <div className="flex h-16 items-center justify-center border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-lg">C</div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      dir={dir}
      className={cn(
        'fixed top-0 bottom-0 z-20 flex flex-col bg-card text-foreground transition-all duration-300',
        dir === 'rtl' ? 'right-0 border-l border-border' : 'left-0 border-r border-border',
        {
          'w-64': !isSidebarCollapsed,
          'w-16': isSidebarCollapsed,
        }
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link href="/app/dashboard" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl select-none">
            C
          </div>
          {!isSidebarCollapsed && (
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent duration-150">
              Cortex AI
            </span>
          )}
        </Link>
      </div>

      {/* Sidebar Navigation items filtered dynamically by user role */}
      <nav className="flex-1 space-y-1.5 px-2 py-4 overflow-y-auto">
        {sidebarItems
          .filter(item => {
            if (!item.allowedRoles || item.allowedRoles.includes(role)) {
              if (item.adminOnly && !isAdmin) return false;
              return true;
            }
            return false;
          })
          .map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center h-10 rounded-lg transition-colors group relative select-none cursor-pointer',
                  {
                    'bg-primary text-primary-foreground': isActive,
                    'hover:bg-muted text-muted-foreground hover:text-foreground': !isActive,
                    'justify-start px-3 space-x-3': !isSidebarCollapsed,
                    'justify-center': isSidebarCollapsed,
                  }
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium leading-none">
                    {t(item.titleKey)}
                  </span>
                )}

                {/* Tooltip on Collapsed */}
                {isSidebarCollapsed && (
                  <div className={cn(
                    'absolute hidden group-hover:block bg-card border border-border text-foreground text-xs font-semibold py-1.5 px-3 rounded-md shadow-md z-30 select-none pointer-events-none whitespace-nowrap',
                    dir === 'rtl' ? 'right-14' : 'left-14'
                  )}>
                    {t(item.titleKey)}
                  </div>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-border flex justify-center">
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-border cursor-pointer transition-colors duration-150"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? (
            dir === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
          ) : (
            dir === 'rtl' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
