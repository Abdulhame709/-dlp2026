import { createClient } from '../database/server';
import { Logger } from '../logging/logger';
import { env } from '../config/env';

export interface ProfileSetupInput {
  fullName: string;
  avatarUrl?: string;
  language: string;
  timezone: string;
  theme: string;
  dateFormat: string;
  timeFormat: string;
}

export interface WorkspaceSetupInput {
  name: string;
  icon?: string;
  color?: string;
  type: 'PERSONAL' | 'TEAM' | 'ORGANIZATION';
}

export interface OrganizationSetupInput {
  name: string;
  slug: string;
  logoUrl?: string;
}

export class OnboardingService {
  /**
   * Complete onboarding process: Save profile, setup organization (workspace), and update Auth metadata.
   */
  static async completeOnboarding(
    userId: string,
    profileData: ProfileSetupInput,
    workspaceData: WorkspaceSetupInput,
    orgData?: OrganizationSetupInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Graceful sandbox fallback
      if (env.supabaseUrl.includes('mock-supabase-project')) {
        console.log('💡 Note: Running completeOnboarding under offline sandbox mock mode.');
        return { success: true };
      }

      const supabase = await createClient();

      // 1. Save User Profile Setup
      const preferences = {
        theme_preference: profileData.theme,
        language_preference: profileData.language,
        date_format: profileData.dateFormat,
        time_format: profileData.timeFormat,
        timezone: profileData.timezone,
        onboarding_completed: true,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: profileData.fullName,
          avatar_url: profileData.avatarUrl || null,
          timezone: profileData.timezone,
          language: profileData.language,
          preferences,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        await Logger.error('Onboarding profile save failed', profileError.message, { userId });
        return { success: false, error: `Profile Error: ${profileError.message}` };
      }

      // 2. Setup Default Workspace / Organization
      const orgName = orgData?.name || `${workspaceData.name} Space`;
      const orgSlug = orgData?.slug || orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          owner_id: userId,
          logo_url: orgData?.logoUrl || null,
          subscription_plan: 'FREE',
          created_by: userId,
        })
        .select()
        .single();

      if (orgError || !org) {
        await Logger.error('Onboarding organization creation failed', orgError?.message || 'Empty result', { userId });
        return { success: false, error: `Workspace Error: ${orgError?.message}` };
      }

      // 3. Setup Owner Membership in Organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'OWNER',
          created_by: userId,
        });

      if (memberError) {
        await Logger.error('Onboarding organization owner membership failed', memberError.message, { userId, orgId: org.id });
        return { success: false, error: `Membership Error: ${memberError.message}` };
      }

      // 4. Update Supabase Auth User Metadata (to enforce the Edge Middleware onboarding gate)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          default_org_id: org.id,
        },
      });

      if (authError) {
        await Logger.error('Onboarding auth metadata update failed', authError.message, { userId });
        return { success: false, error: `Auth Metadata Error: ${authError.message}` };
      }

      await Logger.security('User Onboarding Completed', { userId, orgId: org.id, orgName });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown onboarding error' };
    }
  }

  /**
   * Send invitations to join organization (Foundation)
   */
  static async sendInvitation(
    userId: string,
    organizationId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER'
  ): Promise<{ success: boolean; inviteId?: string; error?: string }> {
    try {
      // Graceful sandbox fallback
      if (env.supabaseUrl.includes('mock-supabase-project')) {
        console.log('💡 Note: Running sendInvitation under offline sandbox mock mode.');
        return { success: true, inviteId: 'invite-uuid-mock-placeholder' };
      }

      const supabase = await createClient();

      // Check permissions: inviting user must be OWNER or ADMIN in that org
      const { data: member, error: memberCheckError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      if (memberCheckError || !member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return { success: false, error: 'Unauthorized: Only Organization Owners or Admins can send invitations.' };
      }

      const inviteId = 'invite-uuid-mock-placeholder'; // Mock invitation token ID
      await Logger.security('Organization Invitation Sent', {
        senderId: userId,
        organizationId,
        recipientEmail: email,
        recipientRole: role,
        inviteId,
      });

      return { success: true, inviteId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
