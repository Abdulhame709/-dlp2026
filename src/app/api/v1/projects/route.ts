import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';
import { createClient } from '@/core/database/server';

/**
 * GET /api/v1/projects - Retrieve user projects
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

  if (SecurityUtils.isRateLimited(`proj-${clientIp}`, 20, 60000)) {
    return NextResponse.json(
      { status: 'error', message: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  // Fetch real user projects from database
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch projects.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'success',
    data: projects || [],
    timestamp: new Date().toISOString(),
  });
}
