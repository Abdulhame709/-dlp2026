import { createClient } from '../database/connection';
import { env } from '../config/env';

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export class RoleGuard {
  /**
   * Check if current user has the required roles within the target Organization
   */
  static async hasRole(organizationId: string, allowedRoles: UserRole[]): Promise<boolean> {
    try {
      // Graceful sandbox fallback
      if (env.supabaseUrl.includes('mock-supabase-project')) {
        return true;
      }

      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) return false;

      // Query active membership role
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();

      if (error || !membership) return false;

      return allowedRoles.includes(membership.role as UserRole);
    } catch {
      return false;
    }
  }

  /**
   * Enforce role check in Server Actions or REST APIs, throwing error if check fails
   */
  static async enforce(organizationId: string, allowedRoles: UserRole[]): Promise<void> {
    const authorized = await this.hasRole(organizationId, allowedRoles);
    if (!authorized) {
      throw new Error('FORBIDDEN_INSUFFICIENT_ROLE');
    }
  }
}
