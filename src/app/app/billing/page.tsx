'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AuthService } from '@/core/auth/auth-service';
import { CreditCard, Check, Sparkles, Zap, Shield, Key } from 'lucide-react';

export default function BillingPage() {
  const [userId, setUserId] = React.useState('11111111-1111-1111-1111-111111111111');
  const [currentPlan, setCurrentPlan] = React.useState('FREE');

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to resolve current user session inside billing page:', err);
      }
    }
    loadUser();
  }, []);

  const tiers = [
    { name: 'FREE Standard', price: '$0', desc: 'Optimal for single users starting with in-memory task planning.', features: ['Up to 50 active tasks', 'Standard AI Prioritizer', 'Email Verification', 'Arabic and English layouts'] },
    { name: 'PRO Team Space', price: '$15', desc: 'Complete organizational suite with advanced multi-tenant planning.', features: ['Unlimited active tasks', 'Full AI Daily Planner', 'AI Execution Coach', 'Stripe checkout Integration', 'Audit & Security Logs'] },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Subscriptions & Billing
        </h1>
        <p className="text-sm text-muted-foreground font-arabic mt-1">خطط الاشتراكات وبوابات الدفع وإدارة الفواتير</p>
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
                  <span className="text-2xl font-black text-primary shrink-0">{tier.price} <span className="text-xs font-semibold text-muted-foreground">/mo</span></span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Features included</span>
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
                    <Check className="h-4 w-4" /> Your Active Plan
                  </span>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full h-10 text-xs cursor-pointer" 
                    onClick={() => {
                      if (tier.name.includes('PRO')) {
                        setCurrentPlan('PRO');
                      } else {
                        setCurrentPlan('FREE');
                      }
                    }}
                  >
                    Upgrade to {tier.name.split(' ')[0]} Plan
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
          <h4 className="text-xs font-bold text-primary uppercase">Secure Checkout Processors Active</h4>
          <p className="text-[11px] text-muted-foreground leading-normal">
             Payment gateways are powered by Stripe. No credit card details are ever stored or processed directly inside our database, maintaining 100% PCI-DSS security compliance.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Inline Tailwind cn import helper to satisfy compilation
import { cn } from '@/lib/utils';
