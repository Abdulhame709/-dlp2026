import { createClient } from '../database/connection';

/**
 * Server-side admin authorization guard.
 * Validates that the current authenticated user has admin privileges.
 * Used to protect /app/admin route and admin API endpoints.
 */
export class AdminGuard {
  /**
   * Check if the current authenticated user is a system admin.
   * Queries the profiles.is_admin column server-side.
   */
  static async isAdmin(): Promise<boolean> {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) return false;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) return false;

      return profile.is_admin === true;
    } catch {
      return false;
    }
  }

  /**
   * Enforce admin access — throws if the current user is not an admin.
   * Use in server actions, API routes, or middleware.
   */
  static async enforce(): Promise<void> {
    const authorized = await this.isAdmin();
    if (!authorized) {
      throw new Error('FORBIDDEN_ADMIN_ACCESS_REQUIRED');
    }
  }
}
