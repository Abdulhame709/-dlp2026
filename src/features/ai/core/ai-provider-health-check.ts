import { IAIProvider } from './ai-provider-interface';
import { AIGateway } from './ai-gateway';
import { AIProviderName } from './ai-types';

export class AIProviderHealthCheck {
  /**
   * Ping a specific AI provider to verify latency and service availability
   */
  static async pingProvider(name: AIProviderName): Promise<{ isHealthy: boolean; latencyMs: number }> {
    const timestamp = Date.now();
    try {
      AIGateway.switchProvider(name);
      const provider = AIGateway.getProvider();
      
      // Execute a lightweight, low-token generation
      await provider.generateCompletion({
        systemInstructions: 'Ping',
        userPrompt: 'Ping',
        maxTokens: 1,
      });

      const latencyMs = Date.now() - timestamp;
      return { isHealthy: true, latencyMs };
    } catch {
      return { isHealthy: false, latencyMs: Date.now() - timestamp };
    }
  }

  /**
   * Run a platform-level health audit across all registered providers
   */
  static async runFullAudit(): Promise<Record<AIProviderName, { isHealthy: boolean; latencyMs: number }>> {
    const providers: AIProviderName[] = ['OPENAI', 'ANTHROPIC', 'GEMINI', 'MOCK'];
    const results: Record<string, any> = {};

    for (const name of providers) {
      results[name] = await this.pingProvider(name);
    }

    return results as Record<AIProviderName, { isHealthy: boolean; latencyMs: number }>;
  }
}
export { AIGateway };
