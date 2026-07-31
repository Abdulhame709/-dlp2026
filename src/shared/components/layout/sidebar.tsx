'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/shared/stores/layout-store';
import { AuthService } from '@/core/auth/auth-service';
import { createClient } from '@/core/database/connection';
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
  MessageSquare
} from 'lucide-react';

interface SidebarItem {
  title: string;
  arabicTitle: string;
  path: string;
  icon: React.ComponentType<any>;
  allowedRoles?: string[];
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', arabicTitle: 'لوحة التحكم', path: '/app/dashboard', icon: LayoutDashboard, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
  { title: 'Tasks', arabicTitle: 'المهام الذكية', path: '/app/tasks', icon: CheckSquare, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Projects', arabicTitle: 'المشاريع', path: '/app/projects', icon: Folder, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Goals', arabicTitle: 'الأهداف', path: '/app/goals', icon: Target, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Calendar', arabicTitle: 'التقويم', path: '/app/calendar', icon: Calendar, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
  { title: 'AI Assistant', arabicTitle: 'مساعد الذكاء الاصطناعي', path: '/app/ai-assistant', icon: BrainCircuit, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Organizations', arabicTitle: 'الشركات ومساحات العمل', path: '/app/organizations', icon: Building, allowedRoles: ['OWNER', 'ADMIN'] },
  { title: 'Notifications', arabicTitle: 'التنبيهات والإشعارات', path: '/app/notifications', icon: Bell, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Billing', arabicTitle: 'الاشتراكات والمدفوعات', path: '/app/billing', icon: CreditCard, allowedRoles: ['OWNER'] },
  { title: 'Feedback', arabicTitle: 'الملاحظات والشكاوي', path: '/app/feedback', icon: MessageSquare, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER'] },
  { title: 'Settings', arabicTitle: 'الإعدادات والخصوصية', path: '/app/settings', icon: Settings, allowedRoles: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();
  const [role, setRole] = React.useState<string>('OWNER'); // Default to OWNER for full access / mock
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');

  // Load active user role and language layout direction on mount
  React.useEffect(() => {
    async function loadIdentityAndLayout() {
      try {
        // Sync language layout
        const activeLanguage = localStorage.getItem('language') || 'en';
        setDir(activeLanguage === 'ar' ? 'rtl' : 'ltr');

        const user = await AuthService.getCurrentUser();
        if (user) {
          // Bypassing real database queries when running in local offline mock mode
          if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('mock-')) {
            setRole('OWNER');
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
        }
      } catch (err) {
        console.error('Failed to load identity/role inside sidebar:', err);
      }
    }
    loadIdentityAndLayout();
  }, []);

  return (
    <aside
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
          .filter(item => !item.allowedRoles || item.allowedRoles.includes(role))
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
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium leading-none">{item.title}</span>
                    <span className="text-[10px] opacity-75 font-arabic mt-0.5">{item.arabicTitle}</span>
                  </div>
                )}

                {/* Tooltip on Collapsed */}
                {isSidebarCollapsed && (
                  <div className="absolute left-14 hidden group-hover:block bg-card border border-border text-foreground text-xs font-semibold py-1.5 px-3 rounded-md shadow-md z-30 select-none pointer-events-none whitespace-nowrap">
                    {item.title} | <span className="font-arabic">{item.arabicTitle}</span>
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
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
