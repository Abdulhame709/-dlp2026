'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { OrganizationService } from '@/features/organizations/organization-service';
import { OrganizationEntity } from '@/features/organizations/repositories/supabase-organization-repository';
import { useLocale } from '@/shared/hooks/use-locale';
import { Building, Plus, Users, Shield, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrganizationsPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [organizations, setOrganizations] = React.useState<OrganizationEntity[]>([]);
  const [activeOrg, setActiveOrg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          // Load real organizations from service
          const orgs = await OrganizationService.getUserOrganizations(user.id);
          setOrganizations(orgs);
          if (orgs.length > 0) {
            setActiveOrg(orgs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside organizations page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> {t('organizations.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-arabic mt-1">{t('organizations.desc')}</p>
        </div>
        <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer">
          <Plus className="h-4 w-4 mr-2" /> {t('organizations.newOrgBtn')}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
            <p className="text-xs text-muted-foreground">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
            <Building className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-bold">No organizations yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Create your first organization to start collaborating.</p>
          </div>
        ) : (
          organizations.map((org) => {
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
                      <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Role: {org.ownerId === userId ? 'OWNER' : 'MEMBER'}</span>
                      <span className="text-primary font-bold">{org.subscriptionPlan} Plan</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Check className="h-4 w-4" /> {t('organizations.activeSpace')}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs"
                      onClick={() => setActiveOrg(org.id)}
                    >
                      {t('organizations.switchSpace')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* RLS/Multi-tenant Safety Callout */}
      <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start space-x-3 select-none">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary uppercase">{t('organizations.isolationGuard')}</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             {t('organizations.isolationDesc')}
          </p>
        </div>
      </Card>
    </div>
  );
}
