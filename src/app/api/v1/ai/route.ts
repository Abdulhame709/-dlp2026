import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';
import { createClient } from '@/core/database/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/ai - AI Gateway endpoint
 * Protected by rate limiting (handled in middleware) and authentication.
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { status: 'error', message: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  // Additional per-user rate limit for AI endpoints
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const rateLimitKey = `ai-user-${user.id}-${clientIp}`;

  if (SecurityUtils.isRateLimited(rateLimitKey, 10, 60000)) {
    return NextResponse.json(
      { status: 'error', message: 'AI request rate limit exceeded. Please slow down.' },
      { status: 429 }
    );
  }

  // CSRF verification for mutation
  const requestOrigin = request.headers.get('origin') || undefined;
  if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
    return NextResponse.json(
      { status: 'error', message: 'CSRF verification failed.' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    status: 'success',
    data: {
      reply: 'Cortex AI Future Orchestrator REST endpoint active.',
    },
    timestamp: new Date().toISOString(),
  });
}
