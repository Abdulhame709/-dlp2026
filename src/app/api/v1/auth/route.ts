import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    message: 'Cortex AI Future Authentication API endpoint active.',
    timestamp: new Date().toISOString(),
  });
}
