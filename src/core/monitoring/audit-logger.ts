import { createClient } from '../database/server';

export class AuditLogger {
  /**
   * Log administrative security/sensitive mutations to the public.audit_logs table
   */
  static async log(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValue: any = null,
    newValue: any = null
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
    };

    console.log(`🛡️ [System Audit Log]: ${action} executed by ${userId}`, JSON.stringify(payload));

    try {
      const supabase = await createClient();
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_value: oldValue ? JSON.stringify(oldValue) : null,
          new_value: newValue ? JSON.stringify(newValue) : null,
        });
    } catch {
      // Graceful fallback for offline sandbox compiles
    }
  }
}
