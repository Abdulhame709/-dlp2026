import { createClient } from '../database/server';

export type Permission = 
  | 'CREATE_TASK' 
  | 'READ_TASK' 
  | 'UPDATE_TASK' 
  | 'DELETE_TASK' 
  | 'INVITE_MEMBER' 
  | 'UPDATE_ORG' 
  | 'MANAGE_BILLING';

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';

// Granular mapping of Roles to specific Permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'CREATE_TASK', 
    'READ_TASK', 
    'UPDATE_TASK', 
    'DELETE_TASK', 
    'INVITE_MEMBER', 
    'UPDATE_ORG', 
    'MANAGE_BILLING'
  ],
  ADMIN: [
    'CREATE_TASK', 
    'READ_TASK', 
    'UPDATE_TASK', 
    'DELETE_TASK', 
    'INVITE_MEMBER'
  ],
  MEMBER: [
    'CREATE_TASK', 
    'READ_TASK', 
    'UPDATE_TASK', 
    'DELETE_TASK'
  ],
};

export class PermissionManager {
  /**
   * Directly check if a specific role possesses the required permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
  }

  /**
   * Query database and authorize user based on permission matrix
   */
  static async authorize(organizationId: string, permission: Permission): Promise<boolean> {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return false;

      // Fetch user role membership in target organization
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();

      if (error || !membership) return false;

      return this.hasPermission(membership.role as UserRole, permission);
    } catch {
      return false;
    }
  }

  /**
   * Enforce permission constraints, throwing standard exceptions on failure
   */
  static async enforce(organizationId: string, permission: Permission): Promise<void> {
    const authorized = await this.authorize(organizationId, permission);
    if (!authorized) {
      throw new Error(`FORBIDDEN_INSUFFICIENT_PERMISSION: Missing required permission [${permission}]`);
    }
  }
}
export type { UserRole as PermissionUserRole };
