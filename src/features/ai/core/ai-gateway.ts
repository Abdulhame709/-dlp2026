import { IAIProvider } from './ai-provider-interface';
import { AIRequest, AIResponse, AIProviderName } from './ai-types';

export class OpenAIAdapter implements IAIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    return {
      content: `[OpenAI Completion]: ${request.userPrompt}`,
      tokenUsage: { promptTokens: 20, completionTokens: 40, totalTokens: 60 },
      modelName: 'gpt-4o',
      providerName: 'OPENAI',
    };
  }
  async generateStructuredOutput<T = any>(request: AIRequest, validator: (data: any) => T): Promise<AIResponse & { structuredJson: T }> {
    throw new Error('Not implemented locally');
  }
  async analyzeContext(context: string): Promise<string> { return 'OpenAI Context Analysis'; }
  estimateTokens(text: string): number { return Math.round(text.length / 4); }
}

export class AnthropicAdapter implements IAIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    return {
      content: `[Claude Completion]: ${request.userPrompt}`,
      tokenUsage: { promptTokens: 30, completionTokens: 60, totalTokens: 90 },
      modelName: 'claude-3-5-sonnet',
      providerName: 'ANTHROPIC',
    };
  }
  async generateStructuredOutput<T = any>(request: AIRequest, validator: (data: any) => T): Promise<AIResponse & { structuredJson: T }> {
    throw new Error('Not implemented locally');
  }
  async analyzeContext(context: string): Promise<string> { return 'Claude Context Analysis'; }
  estimateTokens(text: string): number { return Math.round(text.length / 4); }
}

export class GoogleAIAdapter implements IAIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    return {
      content: `[Gemini Completion]: ${request.userPrompt}`,
      tokenUsage: { promptTokens: 15, completionTokens: 30, totalTokens: 45 },
      modelName: 'gemini-1.5-pro',
      providerName: 'GEMINI',
    };
  }
  async generateStructuredOutput<T = any>(request: AIRequest, validator: (data: any) => T): Promise<AIResponse & { structuredJson: T }> {
    throw new Error('Not implemented locally');
  }
  async analyzeContext(context: string): Promise<string> { return 'Gemini Context Analysis'; }
  estimateTokens(text: string): number { return Math.round(text.length / 4); }
}

export class LocalModelAdapter implements IAIProvider {
  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    return {
      content: `[Local Llama Completion]: ${request.userPrompt}`,
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      modelName: 'llama-3-8b',
      providerName: 'MOCK',
    };
  }
  async generateStructuredOutput<T = any>(request: AIRequest, validator: (data: any) => T): Promise<AIResponse & { structuredJson: T }> {
    throw new Error('Not implemented locally');
  }
  async analyzeContext(context: string): Promise<string> { return 'Local Llama Context Analysis'; }
  estimateTokens(text: string): number { return Math.round(text.length / 4); }
}

export class AIGateway {
  private static adapters: Record<AIProviderName, IAIProvider> = {
    OPENAI: new OpenAIAdapter(),
    ANTHROPIC: new AnthropicAdapter(),
    GEMINI: new GoogleAIAdapter(),
    MOCK: new LocalModelAdapter(),
  };

  private static currentProvider: AIProviderName = 'MOCK';
  private static accumulatedCost = 0; // Simulated cost tracking

  /**
   * Resolve active AI Provider based on model selection strategy
   */
  static getProvider(): IAIProvider {
    return this.adapters[this.currentProvider];
  }

  /**
   * Switch the active model provider at runtime
   */
  static switchProvider(name: AIProviderName): void {
    this.currentProvider = name;
    console.log(`🔌 AI Gateway: Switched primary route to [${name}]`);
  }

  /**
   * Track simulated usage costs based on actual prompt token sizes
   */
  static trackCost(provider: AIProviderName, promptTokens: number, completionTokens: number): void {
    const ratePer1K = {
      OPENAI: 0.015,
      ANTHROPIC: 0.03,
      GEMINI: 0.007,
      MOCK: 0.0,
    };

    const cost = ((promptTokens + completionTokens) / 1000) * ratePer1K[provider];
    this.accumulatedCost += cost;
    console.log(`🧠 AI Gateway [Cost Audit]: Added $${cost.toFixed(5)} (Total accrued: $${this.accumulatedCost.toFixed(5)})`);
  }

  static getAccumulatedCost(): number {
    return this.accumulatedCost;
  }
}
