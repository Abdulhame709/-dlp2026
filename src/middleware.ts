import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from './core/config/env';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        );
      },
    },
  });

  // Safe user resolution via JWT validation
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Private routes that require authentication
  const isPrivateRoute = path.startsWith('/app') || path.startsWith('/api/v1/app');
  
  // Auth routes for unauthenticated users
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password');

  if (isPrivateRoute) {
    if (!user) {
      // Redirect unauthenticated users to login
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Protected Onboarding Flow Guard (بوابات تهيئة المستخدم وتفضيلاته)
    const hasCompletedOnboarding = user.user_metadata?.onboarding_completed === true;
    const isOnboardingPath = path.startsWith('/app/onboarding');

    if (!hasCompletedOnboarding && !isOnboardingPath) {
      // User must finish onboarding before accessing Dashboard / Tasks / Projects
      url.pathname = '/app/onboarding';
      return NextResponse.redirect(url);
    }

    if (hasCompletedOnboarding && isOnboardingPath) {
      // Prevent onboarding screen access for already configured profiles
      url.pathname = '/app/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute) {
    if (user) {
      // Redirect active sessions trying to access login/register to dashboard
      url.pathname = '/app/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
