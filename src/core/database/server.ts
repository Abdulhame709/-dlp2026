import { createServerClient } from '@supabase/ssr';
import { env } from '../config/env';

export async function createClient() {
  // Dynamically import next/headers to isolate server-only modules from client bundles
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions in the background.
        }
      },
    },
  });
}
