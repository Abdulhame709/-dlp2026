import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    data: [
      { id: '44444444-4444-4444-4444-444444444444', name: 'Cortex Platform Launch' }
    ],
    timestamp: new Date().toISOString(),
  });
}
