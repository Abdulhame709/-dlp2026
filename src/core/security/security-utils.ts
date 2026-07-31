import { NextResponse } from 'next/server';

// Lightweight IP-based Rate Limiter (Sliding Window in memory)
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

export class SecurityUtils {
  /**
   * Simple, sliding window Rate Limiter for secure endpoints
   */
  static isRateLimited(ip: string, limit = 20, windowMs = 60000): boolean {
    const now = Date.now();
    const cached = rateLimitCache.get(ip);

    if (!cached || now > cached.expiresAt) {
      rateLimitCache.set(ip, { count: 1, expiresAt: now + windowMs });
      return false;
    }

    if (cached.count >= limit) {
      return true;
    }

    cached.count++;
    return false;
  }

  /**
   * Sanitizes string inputs to prevent XSS (Cross-Site Scripting) attacks
   */
  static sanitizeXSS(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Secures outgoing HTTP responses with standard security headers
   */
  static applySecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    );
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
    return response;
  }

  /**
   * CSRF protection check for mutations
   */
  static verifyCSRF(requestHeaders: Headers, requestOrigin?: string): boolean {
    const origin = requestHeaders.get('origin');
    const referer = requestHeaders.get('referer');
    const host = requestHeaders.get('host');

    if (!origin && !referer) return false;

    // Check if origin matches host
    if (origin && host && !origin.includes(host)) {
      return false;
    }

    return true;
  }
}
