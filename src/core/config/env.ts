export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase-project.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-PLACEHOLDER-DO-NOT-USE-IN-PRODUCTION',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key-PLACEHOLDER-DO-NOT-USE-IN-PRODUCTION',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Safely defaults to true if not explicitly set to 'false' to preserve local offline compatibility
  useMock: process.env.USE_MOCK !== 'false',
  // OpenAI API key for AI provider integration
  openaiApiKey: process.env.OPENAI_API_KEY,
};

// Runtime warning if mock credentials are used in production
if (env.nodeEnv === 'production' && env.supabaseUrl.includes('mock-supabase-project')) {
  console.error('⚠️ CRITICAL: Mock Supabase credentials detected in production! Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

/**
 * Validates that critical environment variables are set in production mode.
 * Returns an array of missing variable names. Empty array means all valid.
 */
export function validateProductionEnv(): string[] {
  const missing: string[] = [];

  if (env.nodeEnv === 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  return missing;
}

/**
 * Check if the current Supabase URL is a real production URL (not a mock fallback).
 */
export function isProductionSupabase(): boolean {
  return !env.supabaseUrl.includes('mock-supabase-project');
}
