'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { SubscriptionService } from '@/features/billing/subscription-service';
import { UserSubscription } from '@/features/billing/billing-types';
import { useLocale } from '@/shared/hooks/use-locale';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const { t } = useLocale();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [subscription, setSubscription] = React.useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          // Load real subscription from service
          const sub = await SubscriptionService.getSubscription(user.id);
          setSubscription(sub);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside billing page:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const currentPlan = subscription?.planName || 'FREE';

  const handleUpgrade = async (tier: 'FREE' | 'PRO' | 'ENTERPRISE') => {
    if (!userId) return;
    try {
      const checkoutUrl = await SubscriptionService.upgradePlan(userId, tier);
      // In production, redirect to Stripe checkout
      // For now, refresh subscription state
      const updatedSub = await SubscriptionService.getSubscription(userId);
      setSubscription(updatedSub);
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
    }
  };

  const tiers = [
    { name: 'FREE Standard', price: '$0', desc: 'Optimal for single users starting with in-memory task planning.', features: ['Up to 50 active tasks', 'Standard AI Prioritizer', 'Email Verification', 'Arabic and English layouts'] },
    { name: 'PRO Team Space', price: '$15', desc: 'Complete organizational suite with advanced multi-tenant planning.', features: ['Unlimited active tasks', 'Full AI Daily Planner', 'AI Execution Coach', 'Stripe checkout Integration', 'Audit & Security Logs'] },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> {t('billing.title')}
        </h1>
        <p className="text-sm text-muted-foreground font-arabic mt-1">{t('billing.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tiers.map((tier) => {
          const isActive = (tier.name.includes('FREE') && currentPlan === 'FREE') || (tier.name.includes('PRO') && currentPlan === 'PRO');
          return (
            <Card 
              key={tier.name} 
              className={cn(
                'p-6 border bg-card rounded-xl flex flex-col justify-between space-y-6 hover:border-primary/20 transition-all',
                { 'border-primary/30 ring-1 ring-primary/25 bg-primary/5': isActive }
              )}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground leading-normal">{tier.desc}</p>
                  </div>
                  <span className="text-2xl font-black text-primary shrink-0">{tier.price} <span className="text-xs font-semibold text-muted-foreground">{t('billing.perMonth')}</span></span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('billing.featuresIncluded')}</span>
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/45">
                {isActive ? (
                  <span className="text-xs font-bold text-primary flex items-center justify-center gap-1 bg-primary/10 h-10 w-full rounded-lg">
                    <Check className="h-4 w-4" /> {t('billing.activePlan')}
                  </span>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full h-10 text-xs cursor-pointer" 
                    onClick={() => {
                      if (tier.name.includes('PRO')) {
                        handleUpgrade('PRO');
                      } else {
                        handleUpgrade('FREE');
                      }
                    }}
                  >
                    {t('billing.upgradeTo', { plan: tier.name.split(' ')[0] })}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment Security notice */}
      <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start space-x-3 select-none">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-primary uppercase">{t('billing.checkoutActive')}</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             {t('billing.checkoutDesc')}
          </p>
        </div>
      </Card>
    </div>
  );
}
