import { env } from './env';

export interface RuntimeConfig {
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  hasServiceRoleKey: boolean;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
  hasGeminiKey: boolean;
  hasStripeKey: boolean;
  isMockActive: boolean;
}

export class ConfigManager {
  private static config: RuntimeConfig | null = null;

  /**
   * Initializes and validates runtime and environmental configurations
   */
  static get(): RuntimeConfig {
    if (this.config) return this.config;

    const isProduction = env.nodeEnv === 'production';
    const isStaging = (env.nodeEnv as string) === 'staging';
    const isDevelopment = env.nodeEnv === 'development';
    const isMockActive = env.useMock;

    const missingKeys: string[] = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-')) {
      missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('mock-')) {
      missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock-')) {
      missingKeys.push('DATABASE_URL');
    }
    if (!process.env.DIRECT_URL || process.env.DIRECT_URL.includes('mock-')) {
      missingKeys.push('DIRECT_URL');
    }

    if (missingKeys.length > 0) {
      console.log('\n====================================================================');
      console.log('⚠️  [CORTEX AI - ENVIRONMENT STATUS]');
      console.log('====================================================================');
      console.log('Note: The following variables are missing or set to mock placeholders:');
      missingKeys.forEach(key => console.log(`  - ${key}`));
      console.log('--------------------------------------------------------------------');
      if (isMockActive) {
        console.log('👉 [SRE Active Fallback]: USE_MOCK is set to TRUE.');
        console.log('   The platform will safely bypass remote databases and APIs,');
        console.log('   running in a fully offline-ready, high-fidelity mock mode.');
        console.log('   (No remote Supabase or OpenAI connections are required!)');
      } else {
        console.warn('🚨 [CRITICAL WARNING]: USE_MOCK is set to FALSE, but keys are missing!');
        console.warn('   The application may fail to connect to remote services.');
        console.warn('   Please configure your credentials in Vercel or local .env.local.');
      }
      console.log('====================================================================\n');
    } else {
      console.log('\n====================================================================');
      console.log('🎉 [CORTEX AI - PRODUCTION CONNECTED]');
      console.log('====================================================================');
      console.log('👉 [Mode]: Cloud Development / Live Production Active.');
      console.log('   Connected directly to remote Supabase PostgreSQL, Storage,');
      console.log('   Realtime socket layers, and active OpenAI gateways.');
      console.log('====================================================================\n');
    }

    this.config = {
      isProduction,
      isStaging,
      isDevelopment,
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('mock-'),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('mock-'),
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('mock-'),
      hasGeminiKey: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('mock-'),
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock-'),
      isMockActive,
    };

    return this.config;
  }

  /**
   * Safe check for active Stripe configurations before initializing checkout pipelines
   */
  static isBillingActive(): boolean {
    return this.get().hasStripeKey;
  }

  /**
   * Safe check for active AI Gateway configurations before executing prompts
   */
  static isAIPoolActive(provider: 'OPENAI' | 'ANTHROPIC' | 'GEMINI'): boolean {
    const activeConfig = this.get();
    if (provider === 'OPENAI') return activeConfig.hasOpenAIKey;
    if (provider === 'ANTHROPIC') return activeConfig.hasAnthropicKey;
    if (provider === 'GEMINI') return activeConfig.hasGeminiKey;
    return false;
  }
}
