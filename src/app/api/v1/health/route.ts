import { NextResponse } from 'next/server';
import { ConfigManager } from '@/core/config/config-manager';
import { createClient } from '@/core/database/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = ConfigManager.get();
  
  const healthStatus: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api: 'available',
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      useMock: config.isMockActive,
    },
    integrations: {
      supabaseUrl: config.supabaseUrl !== 'https://mock-supabase-project.supabase.co' ? 'configured' : 'mock',
      openai: config.hasOpenAIKey ? 'active' : 'mock',
      stripe: config.hasStripeKey ? 'active' : 'mock',
    },
    services: {
      database: 'bypass_mock_active',
      supabase: 'bypass_mock_active',
    }
  };

  // If mock mode is turned off, verify real connection to database and Supabase client
  if (!config.isMockActive) {
    try {
      const supabase = await createClient();
      
      // Test simple select on active tables to verify connectivity & permissions
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key')
        .limit(1);

      if (error) {
        healthStatus.status = 'unstable';
        healthStatus.services.supabase = 'failed';
        healthStatus.services.database = `failed_error: ${error.message}`;
      } else {
        healthStatus.services.supabase = 'connected';
        healthStatus.services.database = 'connected';
      }
    } catch (err: any) {
      healthStatus.status = 'unhealthy';
      healthStatus.services.supabase = 'failed';
      healthStatus.services.database = `error: ${err.message}`;
    }
  }

  const responseCode = healthStatus.status === 'healthy' ? 200 : 500;
  return NextResponse.json(healthStatus, { status: responseCode });
}
