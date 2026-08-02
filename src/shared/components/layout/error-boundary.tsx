'use client';

import * as React from 'react';
import { Button } from '../ui/button';
import { AlertOctagon } from 'lucide-react';
import { translate } from '@/core/utils/i18n';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught rendering boundary error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const locale = typeof window !== 'undefined' && localStorage.getItem('language') === 'ar' ? 'ar' : 'en';
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 select-none">
          <div className="max-w-md w-full border border-border bg-card rounded-xl p-8 shadow-md text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
              <AlertOctagon className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">{translate(locale, 'common.errorTitle')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translate(locale, 'common.errorDesc')}
              </p>
            </div>

            {this.state.error && (
              <pre className="text-[10px] text-left overflow-auto max-h-32 bg-muted p-3 rounded-lg border border-border font-mono text-muted-foreground leading-normal">
                {this.state.error.message}
              </pre>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                {translate(locale, 'common.resetTryAgain')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
