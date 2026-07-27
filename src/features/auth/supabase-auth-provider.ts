import { createClient } from '@/core/database/server';
import { Logger } from '@/core/logging/logger';

export class SupabaseAuthProvider {
  /**
   * Initiate standard Email and Password authentication session
   */
  static async signInWithEmail(email: string, pass: string): Promise<any> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      await Logger.security('Supabase SignIn Failed', { email, errorMessage: error.message });
      throw new Error(`AUTH_SIGNIN_FAILED: ${error.message}`);
    }

    await Logger.security('Supabase SignIn Success', { email, userId: data.user?.id });
    return data.session;
  }

  /**
   * Send a secure Magic Link activation mail to the user
   */
  static async sendMagicLink(email: string, redirectTo: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      await Logger.security('Supabase MagicLink Failed', { email, errorMessage: error.message });
      throw new Error(`AUTH_MAGICLINK_FAILED: ${error.message}`);
    }

    await Logger.security('Supabase MagicLink Sent', { email });
    return true;
  }

  /**
   * Trigger OAuth Providers login redirections (e.g. Google, Apple)
   */
  static async signInWithOAuth(provider: 'google' | 'apple', redirectTo: string): Promise<{ url: string }> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error || !data.url) {
      throw new Error(`AUTH_OAUTH_FAILED: ${error?.message || 'Empty response url'}`);
    }

    return { url: data.url };
  }

  /**
   * Terminate active user sessions across all connected browser tabs & devices
   */
  static async logoutEverywhere(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Supabase signOut with 'global' scope revokes all active access tokens
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw new Error(error.message);

      await Logger.security('Logout Everywhere Success', { userId: user.id, email: user.email });
      return true;
    }
    
    return false;
  }
}
