import { createClient } from '../database/server';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';

export class Logger {
  // Generic logs outputs
  private static log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    const logPayload = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (level === 'ERROR') {
      console.error(JSON.stringify(logPayload));
    } else if (level === 'WARNING') {
      console.warn(JSON.stringify(logPayload));
    } else {
      console.log(JSON.stringify(logPayload));
    }
  }

  static info(message: string, meta: Record<string, any> = {}) {
    this.log('INFO', message, meta);
  }

  static warn(message: string, meta: Record<string, any> = {}) {
    this.log('WARNING', message, meta);
  }

  static error(message: string, error: Error | string, meta: Record<string, any> = {}) {
    this.log('ERROR', message, {
      errorMessage: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
    });
  }

  // Security and Auditing logs
  static async security(event_name: string, meta: Record<string, any> = {}) {
    this.log('SECURITY', `Security Event: ${event_name}`, meta);

    // Persist security logs inside public.activity_logs when possible
    try {
      const userId = meta.userId;
      if (userId) {
        const supabase = await createClient();
        await supabase
          .from('activity_logs')
          .insert({
            user_id: userId,
            event_name: `security_${event_name.toLowerCase().replace(/\s+/g, '_')}`,
            metadata: meta,
          });
      }
    } catch (err: any) {
      console.warn('Failed to write security log to database:', err.message);
    }
  }
}
