import { env } from '../config/env';

export class ErrorTracker {
  /**
   * Captures and logs exceptions to console, prepared for Sentry.captureException
   */
  static captureException(error: Error | string, extraMeta: Record<string, any> = {}): void {
    const errorPayload = {
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...extraMeta,
    };

    console.error('🚨 [SRE Monitoring Exception]:', JSON.stringify(errorPayload));

    // Future Sentry Integration Trigger:
    // if (env.nodeEnv === 'production') {
    //   Sentry.captureException(error, { extra: extraMeta });
    // }
  }
}
