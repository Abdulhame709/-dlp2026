import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';

/**
 * POST /api/v1/auth - Authentication endpoint
 * Protected by strict rate limiting to prevent brute-force attacks.
 */
export async function POST(request: NextRequest) {
  // Rate limiting for auth endpoints — strict: 5 requests per minute per IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (SecurityUtils.isRateLimited(clientIp, 5, 60000)) {
    return NextResponse.json(
      { status: 'error', message: 'Too many authentication attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // CSRF verification for auth mutation
  const requestOrigin = request.headers.get('origin') || undefined;
  if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
    return NextResponse.json(
      { status: 'error', message: 'CSRF verification failed.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    status: 'success',
    message: 'Cortex AI Authentication API endpoint active.',
    timestamp: new Date().toISOString(),
  });
}
