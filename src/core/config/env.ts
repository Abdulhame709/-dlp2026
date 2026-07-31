export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase-project.supabase.co',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-1234567890-abcdefghijklmnopqrstuvwxyz',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key-1234567890-abcdefghijklmnopqrstuvwxyz',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Safely defaults to true if not explicitly set to 'false' to preserve local offline compatibility
  useMock: process.env.USE_MOCK !== 'false',
};
