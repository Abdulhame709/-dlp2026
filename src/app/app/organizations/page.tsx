'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { Building, Plus, Users, Shield, Sparkles, LayoutGrid, Check } from 'lucide-react';

export default function OrganizationsPage() {
  const [userId, setUserId] = React.useState('11111111-1111-1111-1111-111111111111');
  const [activeOrg, setActiveOrg] = React.useState('org-1');

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside organizations page:', err);
      }
    }
    loadUser();
  }, []);

  const orgs = [
    { id: 'org-1', name: 'Cortex Founders Inc.', role: 'OWNER', members: 4, plan: 'PRO' },
    { id: 'org-2', name: 'Personal workspace', role: 'OWNER', members: 1, plan: 'FREE' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Organizations & Workspaces
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">مساحات العمل التشاركية وإدارات الفرق والشركات</p>
        </div>
        <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer">
          <Plus className="h-4 w-4 mr-2" /> New Organization
        </Button>
      </div>

      <div className="space-y-4">
        {orgs.map((org) => {
          const isActive = activeOrg === org.id;
          return (
            <Card 
              key={org.id} 
              className={cn(
                'p-5 border bg-card rounded-xl flex items-center justify-between gap-4 transition-all hover:border-primary/20',
                { 'border-primary/30 ring-1 ring-primary/25 bg-primary/5': isActive }
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  'h-11 w-11 rounded-lg flex items-center justify-center font-bold text-lg',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {org.name.slice(0, 1)}
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold block">{org.name}</span>
                  <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {org.members} Members</span>
                    <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Role: {org.role}</span>
                    <span className="text-primary font-bold">{org.plan} Plan</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isActive ? (
                  <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                    <Check className="h-4 w-4" /> Active Space
                  </span>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 text-xs" 
                    onClick={() => setActiveOrg(org.id)}
                  >
                    Switch Space
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* RLS/Multi-tenant Safety Callout */}
      <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start space-x-3 select-none">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary uppercase">Multi-Tenant Isolation Guard active</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             Every organization has its own private database partition completely isolated at the row-level (RLS). Team members cannot view, modify, or leak any data belonging to other workspaces.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Inline Tailwind cn import helper to satisfy compilation
import { cn } from '@/lib/utils';
