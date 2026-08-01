import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from './core/config/env';
import { SecurityUtils } from './core/security/security-utils';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ──────────────────────────────────────────────────────────
  // C3 — Apply Security Headers to every response
  // ──────────────────────────────────────────────────────────
  response = SecurityUtils.applySecurityHeaders(response);

  // ──────────────────────────────────────────────────────────
  // C4 — Rate Limiting on sensitive endpoints
  // ──────────────────────────────────────────────────────────
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  // Auth routes: strict rate limit (5 requests per minute)
  const isAuthMutation = request.method === 'POST' && (
    request.nextUrl.pathname === '/api/v1/auth' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password')
  );

  // AI API routes: moderate rate limit (10 requests per minute)
  const isAIEndpoint = request.nextUrl.pathname.startsWith('/api/v1/ai');

  // General API mutations: standard rate limit (20 requests per minute)
  const isApiMutation = request.method !== 'GET' && request.nextUrl.pathname.startsWith('/api/');

  if (isAuthMutation) {
    if (SecurityUtils.isRateLimited(clientIp, 5, 60000)) {
      return NextResponse.json(
        { status: 'error', message: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }
  } else if (isAIEndpoint) {
    if (SecurityUtils.isRateLimited(`ai-${clientIp}`, 10, 60000)) {
      return NextResponse.json(
        { status: 'error', message: 'AI request rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }
  } else if (isApiMutation) {
    if (SecurityUtils.isRateLimited(`api-${clientIp}`, 20, 60000)) {
      return NextResponse.json(
        { status: 'error', message: 'Request rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // C5 — CSRF Protection for state-changing requests
  // ──────────────────────────────────────────────────────────
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    const requestOrigin = request.headers.get('origin') || undefined;
    if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
      return NextResponse.json(
        { status: 'error', message: 'CSRF verification failed. Request origin does not match.' },
        { status: 403 }
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // Authentication & Session Resolution
  // ──────────────────────────────────────────────────────────
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
        // Re-apply security headers after cookie refresh
        response = SecurityUtils.applySecurityHeaders(response);
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

  // ──────────────────────────────────────────────────────────
  // C2 — Admin Route Protection
  // ──────────────────────────────────────────────────────────
  const isAdminRoute = path.startsWith('/app/admin') || path.startsWith('/api/v1/admin');

  if (isAdminRoute) {
    if (!user) {
      // Unauthenticated — redirect to login
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Check admin status server-side
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const isAdmin = !profileError && profile?.is_admin === true;

    if (!isAdmin) {
      // Authenticated but not admin — redirect to dashboard
      url.pathname = '/app/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (isPrivateRoute) {
    if (!user) {
      // Redirect unauthenticated users to login
      url.pathname = '/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Protected Onboarding Flow Guard
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
