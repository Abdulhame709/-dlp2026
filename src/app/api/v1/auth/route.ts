import { NextRequest, NextResponse } from 'next/server';
import { SecurityUtils } from '@/core/security/security-utils';
import { createClient } from '@/core/database/server';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  fullName: z.string().min(1, { message: 'Full name is required' }).optional(),
});

/**
 * POST /api/v1/auth - Authentication endpoint (sign in or sign up)
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

  try {
    const body = await request.json();
    const action = body.action || 'signIn';

    const supabase = await createClient();

    if (action === 'signUp') {
      const validated = signUpSchema.parse(body);
      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: validated.fullName || '',
          },
        },
      });

      if (error) {
        return NextResponse.json(
          { status: 'error', message: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: 'success',
        data: { user: data.user, session: data.session },
        message: 'Account created successfully.',
        timestamp: new Date().toISOString(),
      }, { status: 201 });
    }

    // Default: sign in
    const validated = signInSchema.parse(body);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { user: data.user, session: data.session },
      message: 'Authenticated successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { status: 'error', message: 'Validation failed.', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Authentication request failed.' },
      { status: 500 }
    );
  }
}
