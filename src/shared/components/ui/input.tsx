import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label className="text-sm font-medium text-foreground/90 select-none">
            {label}
          </label>
        ) : null}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed duration-150',
            {
              'border-error focus:ring-error': error,
            },
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-error select-none">{error}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
