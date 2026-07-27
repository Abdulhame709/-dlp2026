import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'success',
    data: {
      range: 'WEEKLY',
      completionPercentage: 88,
      growthRate: 12.5,
    },
    timestamp: new Date().toISOString(),
  });
}
