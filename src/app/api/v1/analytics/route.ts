import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';
import { createClient } from '@/core/database/server';

/**
 * GET /api/v1/analytics - Retrieve user analytics
 * Protected by authentication and rate limiting.
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { status: 'error', message: 'Authentication required.' },
      { status: 401 }
    );
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (SecurityUtils.isRateLimited(`analytics-${clientIp}`, 20, 60000)) {
    return NextResponse.json(
      { status: 'error', message: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  // Fetch real productivity metrics from AnalyticsService
  const { AnalyticsService } = await import('@/features/analytics/analytics-service');
  const metrics = await AnalyticsService.getMetrics(user.id);

  return NextResponse.json({
    status: 'success',
    data: metrics,
    timestamp: new Date().toISOString(),
  });
}
