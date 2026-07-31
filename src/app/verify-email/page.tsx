'use client';

import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg text-center select-none">
        {/* Branding header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verify Your Email
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We have sent a confirmation link to your email address. Please click on the link to verify your account and complete the onboarding setup.
          </p>
          <div className="text-xs text-muted-foreground bg-muted border border-border p-3 rounded-lg leading-relaxed">
            💡 <strong>Tip:</strong> If you do not see the email inside your Inbox, please check your Spam or Junk folders.
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-3">
          <Link
            href="/login"
            className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Go to Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
