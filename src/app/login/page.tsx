'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/core/auth/auth-service';
import { useLocale } from '@/shared/hooks/use-locale';
import { Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

function LoginForm() {
  const { t, dir } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.login(email, password);
      if (res.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg">
      {/* Branding header */}
      <div className="flex flex-col items-center text-center space-y-2 select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-2xl shadow-sm">
          C
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Cortex AI
        </span>
        <p className="text-sm text-muted-foreground">{t('auth.signInDesc')}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 font-medium animate-shake">
          {error}
        </div>
      )}

      {/* LoginForm */}
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

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-muted-foreground" htmlFor="password">
              {t('auth.passwordLabel')}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t('auth.forgotPasswordTitle')}
            </Link>
          </div>
          <input
            className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            id="password"
            type="password"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              {t('auth.signInBtn')} <ArrowRight className={dir === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border select-none">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          {t('auth.signUpFree')}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { dir } = useLocale();
  return (
    <div dir={dir} className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <React.Suspense
        fallback={
          <div className="flex flex-col items-center space-y-4 text-center select-none animate-pulse">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary/40 font-bold text-2xl shadow-sm">
              C
            </div>
            <p className="text-xs text-muted-foreground font-semibold">Initializing Secure Session...</p>
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
