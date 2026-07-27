import { IAIProvider } from './ai-provider-interface';
import { MockAIProvider } from './mock-ai-provider';
import { AIRequest, AIResponse, AIProviderName } from './ai-types';
import { EventBus } from '@/core/utils/event-bus';
import { SecurityUtils } from '@/core/security/security-utils';

export class AIService {
  private static provider: IAIProvider = new MockAIProvider();
  private static providerName: AIProviderName = 'MOCK';

  /**
   * Set active AI Provider dynamically (Model Switching / FALLBACKS)
   */
  static setProvider(name: AIProviderName, customProvider: IAIProvider) {
    this.provider = customProvider;
    this.providerName = name;
    console.log(`🔌 AI Orchestrator: Swapped active provider to [${name}]`);
  }

  /**
   * Enforces prompt security rules: blocks injections and sanitizes malicious input
   */
  private static checkPromptSafety(userPrompt: string): string {
    const lower = userPrompt.toLowerCase();
    
    // 1. Basic Prompt Injection and system prompt leak protections
    const injectionKeywords = [
      'ignore previous',
      'system prompt',
      'you are now a',
      'bypass',
      'reveal your developer key',
    ];

    for (const keyword of injectionKeywords) {
      if (lower.includes(keyword)) {
        throw new Error('AI_SAFETY_VIOLATION: Suspicious activity or prompt injection detected.');
      }
    }

    // 2. HTML and script sanitization
    return SecurityUtils.sanitizeXSS(userPrompt);
  }

  /**
   * Executes textual generation with full logging, auditing, and fallback options
   */
  static async generateCompletion(userId: string, request: AIRequest): Promise<AIResponse> {
    const timestamp = Date.now();
    
    // Publish Request Started Event
    await EventBus.publish('AI_REQUEST_STARTED', { userId, timestamp, provider: this.providerName });

    try {
      // Input sanitization check
      const sanitizedPrompt = this.checkPromptSafety(request.userPrompt);
      const safeRequest = { ...request, userPrompt: sanitizedPrompt };

      const response = await this.provider.generateCompletion(safeRequest);

      // Publish Request Completed Event (Telemetry / Quotas tracking)
      await EventBus.publish('AI_REQUEST_COMPLETED', {
        userId,
        timestamp,
        duration: Date.now() - timestamp,
        tokenUsage: response.tokenUsage,
        provider: this.providerName,
      });

      return response;
    } catch (err: any) {
      // Publish Request Failed Event
      await EventBus.publish('AI_REQUEST_FAILED', {
        userId,
        timestamp,
        error: err.message,
        provider: this.providerName,
      });
      throw err;
    }
  }

  /**
   * Executes structured JSON generation with automatic Zod parsing and verification
   */
  static async generateStructuredOutput<T = any>(
    userId: string,
    request: AIRequest,
    validator: (data: any) => T
  ): Promise<AIResponse & { structuredJson: T }> {
    const timestamp = Date.now();
    await EventBus.publish('AI_REQUEST_STARTED', { userId, timestamp, provider: this.providerName });

    try {
      const sanitizedPrompt = this.checkPromptSafety(request.userPrompt);
      const safeRequest = { ...request, userPrompt: sanitizedPrompt };

      const response = await this.provider.generateStructuredOutput<T>(safeRequest, validator);

      await EventBus.publish('AI_REQUEST_COMPLETED', {
        userId,
        timestamp,
        duration: Date.now() - timestamp,
        tokenUsage: response.tokenUsage,
        provider: this.providerName,
      });

      return response;
    } catch (err: any) {
      await EventBus.publish('AI_REQUEST_FAILED', {
        userId,
        timestamp,
        error: err.message,
        provider: this.providerName,
      });
      throw err;
    }
  }
}
export type { IAIProvider };
