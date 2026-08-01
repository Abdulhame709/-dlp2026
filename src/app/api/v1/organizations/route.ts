import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';
import { createClient } from '@/core/database/server';

/**
 * GET /api/v1/organizations - Retrieve user organizations
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

  if (SecurityUtils.isRateLimited(`org-${clientIp}`, 20, 60000)) {
    return NextResponse.json(
      { status: 'error', message: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  // Fetch real user organizations from database
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      organization:organizations(id, name),
      role
    `)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch organizations.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'success',
    data: memberships || [],
    timestamp: new Date().toISOString(),
  });
}
