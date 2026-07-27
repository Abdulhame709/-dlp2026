import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    data: [
      { id: '22222222-2222-2222-2222-222222222222', name: 'Cortex Founders Inc.' }
    ],
    timestamp: new Date().toISOString(),
  });
}
