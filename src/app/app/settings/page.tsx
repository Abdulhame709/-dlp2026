'use client';

import * as React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Settings, Shield, User, Bell, Database, Key, Sparkles, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none p-6 text-foreground">
      {/* Header panel */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Settings & Preferences
        </h1>
        <p className="text-sm text-muted-foreground font-arabic mt-1">إعدادات الحساب وتفضيلات الخصوصية وأنظمة الحماية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Panel */}
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs bg-primary/10 text-primary font-bold">
            <User className="h-4 w-4 mr-2" /> Profile Details
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Shield className="h-4 w-4 mr-2" /> Security & RLS
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start h-10 text-xs">
            <Database className="h-4 w-4 mr-2" /> Data Export
          </Button>
        </div>

        {/* Configurations content wrapper */}
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6 border border-border bg-card rounded-xl space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Full Name</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center">
                    Abdul Demo User
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Email Address</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center">
                    owner@cortexai.com
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-border/40 pb-2">
                <Sparkles className="h-4 w-4 text-primary" /> Assistant Localization
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Primary Language</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center justify-between">
                    <span>English (Inter/Jakarta)</span>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Regional Dialect</span>
                  <div className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs flex items-center justify-between">
                    <span>Arabic (Cairo/Cairo)</span>
                    <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded uppercase font-arabic">Cairo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/40">
              <Button variant="primary" size="sm" className="h-10 text-xs cursor-pointer">
                Save Preferences
              </Button>
            </div>
          </Card>

          {/* Secure API Credentials notice */}
          <Card className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-2">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-primary">
              <Key className="h-4 w-4" /> Production Access Active
            </h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Your session is securely governed by PostgreSQL Row-Level Security (RLS). All organizations, goals, and tasks are strictly isolated to protect multi-tenant integrity.
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
}
