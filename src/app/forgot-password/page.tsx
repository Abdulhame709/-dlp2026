'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthService } from '@/core/auth/auth-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { Loader2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t, dir } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const redirectTo = `${origin}/reset-password`;

      const res = await AuthService.forgotPassword(email, redirectTo);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to send recovery email');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-2xl shadow-sm">
            C
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cortex AI
          </span>
          <p className="text-sm text-muted-foreground">{t('auth.forgotPasswordDesc')}</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 font-medium animate-shake">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg p-4 font-medium animate-fade">
              📩 {t('auth.checkEmail')}
            </div>
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors cursor-pointer select-none"
            >
              {t('auth.returnToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="email">
                {t('auth.emailLabel')}
              </label>
              <input
                className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {t('auth.sendRecoveryLink')} <ArrowRight className={dir === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                </>
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border select-none">
            {t('auth.rememberedPassword')}{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              {t('auth.signInBtn')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
