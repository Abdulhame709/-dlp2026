'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/core/auth/auth-service';
import { Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await AuthService.updatePassword(password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to reset password');
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
          <p className="text-sm text-muted-foreground">Setup your new password securely</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-4 font-medium animate-shake">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg p-4 font-medium animate-fade">
              🎉 Password successfully updated! You can now log in using your new password.
            </div>
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer select-none"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="password">
                New Password
              </label>
              <input
                className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted-foreground" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full h-11 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                  Update Password <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
