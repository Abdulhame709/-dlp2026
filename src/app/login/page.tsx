'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/core/auth/auth-service';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 space-y-6 shadow-lg">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-2xl shadow-sm">
            C
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cortex AI
          </span>
          <p className="text-sm text-muted-foreground">Sign in to access your intelligent dashboard</p>
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
              Email Address
            </label>
            <input
              className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              id="password"
              type="password"
              placeholder="••••••••"
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
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border select-none">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
}
