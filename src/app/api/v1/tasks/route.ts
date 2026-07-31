import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/features/tasks/services/task-service';
import { ErrorHandler, AppError } from '@/core/utils/error-handler';
import { z } from 'zod';

const createTaskApiSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(255),
  description: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['INBOX', 'PLANNED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'ARCHIVED']).optional(),
});

/**
 * GET /api/v1/tasks - Retrieve standard user tasks
 */
export async function GET(request: NextRequest) {
  try {
    const userId = '11111111-1111-1111-1111-111111111111'; // Mock resolved from session
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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTaskApiSchema.parse(body);

    const userId = '11111111-1111-1111-1111-111111111111';
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
