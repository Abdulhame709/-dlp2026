import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/features/tasks/services/task-service';
import { ErrorHandler, AppError } from '@/core/utils/error-handler';
import { SecurityUtils } from '@/core/security/security-utils';
import { z } from 'zod';
import { createClient } from '@/core/database/server';

const createTaskApiSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(255),
  description: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['INBOX', 'PLANNED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'ARCHIVED']).optional(),
});

const updateTaskApiSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['INBOX', 'PLANNED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'ARCHIVED']).optional(),
});

/**
 * Resolves the authenticated user ID from the Supabase session.
 * Returns 401 if no valid session is found.
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<string | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { status: 'error', message: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  return user.id;
}

/**
 * GET /api/v1/tasks - Retrieve standard user tasks
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (typeof userId !== 'string') return userId; // 401 response

    const list = await TaskService.getUserTasks(userId);

    return NextResponse.json({
      status: 'success',
      data: list,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return ErrorHandler.handle(err);
  }
}

/**
 * POST /api/v1/tasks - Create standard tasks via API
 * Protected by CSRF verification and rate limiting.
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF verification for mutation
    const requestOrigin = request.headers.get('origin') || undefined;
    if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
      return NextResponse.json(
        { status: 'error', message: 'CSRF verification failed.' },
        { status: 403 }
      );
    }

    const userId = await getAuthenticatedUserId(request);
    if (typeof userId !== 'string') return userId; // 401 response

    const body = await request.json();
    const validated = createTaskApiSchema.parse(body);

    const task = await TaskService.createTask(userId, validated);

    return NextResponse.json({
      status: 'success',
      data: task,
      message: 'Task created successfully via REST API.',
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: any) {
    return ErrorHandler.handle(err);
  }
}

/**
 * PUT /api/v1/tasks - Update an existing task via API
 * Protected by CSRF verification and rate limiting.
 */
export async function PUT(request: NextRequest) {
  try {
    const requestOrigin = request.headers.get('origin') || undefined;
    if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
      return NextResponse.json(
        { status: 'error', message: 'CSRF verification failed.' },
        { status: 403 }
      );
    }

    const userId = await getAuthenticatedUserId(request);
    if (typeof userId !== 'string') return userId; // 401 response

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Task ID is required for updates.' },
        { status: 400 }
      );
    }

    const validated = updateTaskApiSchema.parse(updates);
    const task = await TaskService.updateTask(id, validated);

    return NextResponse.json({
      status: 'success',
      data: task,
      message: 'Task updated successfully via REST API.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return ErrorHandler.handle(err);
  }
}

/**
 * DELETE /api/v1/tasks - Delete a task via API
 * Protected by CSRF verification and rate limiting.
 */
export async function DELETE(request: NextRequest) {
  try {
    const requestOrigin = request.headers.get('origin') || undefined;
    if (!SecurityUtils.verifyCSRF(request.headers, requestOrigin)) {
      return NextResponse.json(
        { status: 'error', message: 'CSRF verification failed.' },
        { status: 403 }
      );
    }

    const userId = await getAuthenticatedUserId(request);
    if (typeof userId !== 'string') return userId; // 401 response

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { status: 'error', message: 'Task ID is required for deletion.' },
        { status: 400 }
      );
    }

    await TaskService.deleteTask(taskId);

    return NextResponse.json({
      status: 'success',
      message: 'Task deleted successfully via REST API.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return ErrorHandler.handle(err);
  }
}
