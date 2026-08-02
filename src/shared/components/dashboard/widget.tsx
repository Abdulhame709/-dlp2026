import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

export interface WidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  isLoading?: boolean;
  error?: string;
  actions?: React.ReactNode;
}

export function Widget({
  className,
  title,
  description,
  icon: Icon,
  isLoading,
  error,
  actions,
  children,
  ...props
}: WidgetProps) {
  return (
    <Card className={cn('h-full flex flex-col p-5', className)} {...props}>
      {/* Widget Header area */}
      <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border mb-3 p-0">
        <div className="space-y-1 select-none">
          <CardTitle className="flex items-center text-base font-bold tracking-tight">
            {Icon && <Icon className="h-4.5 w-4.5 text-primary mr-2 shrink-0" />}
            {title}
          </CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center space-x-1.5">{actions}</div>}
      </CardHeader>

      {/* Widget Body Content with Loading & Error States */}
      <CardContent className="flex-1 p-0 flex flex-col">
        {isLoading ? (
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-4 flex-1 select-none">
            <p className="text-sm font-semibold text-error">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Failed to load telemetry widget details.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
