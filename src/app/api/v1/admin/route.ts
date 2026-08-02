import { NextRequest, NextResponse } from 'next/server';
import { AdminGuard } from '@/core/auth/admin-guard';

/**
 * GET /api/v1/admin/stats - Admin statistics endpoint
 * Protected by admin authorization check.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await AdminGuard.enforce();

    // Admin-only data can be fetched here
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Admin access verified.',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message === 'FORBIDDEN_ADMIN_ACCESS_REQUIRED') {
      return NextResponse.json(
        { status: 'error', message: 'Admin access required.' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
