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
}

export class ConfigManager {
  private static config: RuntimeConfig | null = null;

  /**
   * Initializes and validates runtime and environmental configurations
   */
  static get(): RuntimeConfig {
    if (this.config) return this.config;

    const isProduction = env.nodeEnv === 'production';
    const isStaging = env.nodeEnv === 'staging';
    const isDevelopment = env.nodeEnv === 'development';

    // Strict Production Key validation checks (Prevents deployment with empty/mock configurations)
    if (isProduction || isStaging) {
      const missingKeys: string[] = [];
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-')) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
      }
      if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('mock-')) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
      if (isProduction && (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('mock-'))) {
        missingKeys.push('SUPABASE_SERVICE_ROLE_KEY');
      }

      if (missingKeys.length > 0) {
        console.warn(
          `⚠️ [SRE Config Warning]: Missing critical production credentials: [${missingKeys.join(', ')}]. Falling back to development configurations.`
        );
      }
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
