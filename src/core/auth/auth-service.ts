import { createClient } from '../database/server';
import { Logger } from '../logging/logger';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  timezone: string;
  language: string;
  preferences: Record<string, any>;
}

export class AuthService {
  // Sign Up with Email & Password
  static async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        await Logger.security('Failed Login/Registration Attempt', { email, error: error.message });
        return { success: false, error: error.message };
      }

      const user = data.user;
      if (user) {
        // Defensive creation of local user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            timezone: 'UTC',
            language: 'en',
            preferences: {},
          });

        if (profileError) {
          console.warn('Defensive profile creation error:', profileError.message);
        }

        await Logger.security('User Registration Success', { email, userId: user.id });
      }

      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown registration error' };
    }
  }

  // Login with Email & Password
  static async login(email: string, password: string): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await Logger.security('Failed Login Attempt', { email, error: error.message });
        return { success: false, error: error.message };
      }

      await Logger.security('Login Success', { email, userId: data.user?.id });
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown authentication error' };
    }
  }

  // Logout current session
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      if (user) {
        await Logger.security('Logout Success', { userId: user.id, email: user.email });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown sign out error' };
    }
  }

  // Retrieve current active user session profile
  static async getCurrentUser(): Promise<UserSession | null> {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      // Fetch accompanying profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback profile if record is missing (ensuring resilience)
        return {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || 'Cortex User',
          timezone: 'UTC',
          language: 'en',
          preferences: {},
        };
      }

      return {
        id: profile.id,
        email: user.email || '',
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        timezone: profile.timezone,
        language: profile.language,
        preferences: profile.preferences as Record<string, any>,
      };
    } catch {
      return null;
    }
  }

  // Password Recovery Reset trigger
  static async forgotPassword(email: string, redirectTo: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        await Logger.security('Password Reset Request Failed', { email, error: error.message });
        return { success: false, error: error.message };
      }

      await Logger.security('Password Reset Request Success', { email });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Update password inside secure session
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Logger.security('Password Update Success', { userId: user.id, email: user.email });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
