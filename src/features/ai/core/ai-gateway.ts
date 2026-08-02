import { IAIProvider } from './ai-provider-interface';
import { AIRequest, AIResponse, AIProviderName } from './ai-types';

export class OpenAIAdapter implements IAIProvider {
  private apiKey: string | undefined;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      // Fallback: return a clearly marked mock response when no API key is configured
      return {
        content: `[OpenAI Stub — No API Key] ${request.userPrompt}`,
        tokenUsage: { promptTokens: 20, completionTokens: 40, totalTokens: 60 },
        modelName: 'gpt-4o',
        providerName: 'OPENAI',
      };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: request.systemInstructions || 'You are a helpful assistant.' },
          { role: 'user', content: request.userPrompt },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const usage = data.usage;

    return {
      content: choice?.message?.content || '',
      tokenUsage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
      },
      modelName: 'gpt-4o',
      providerName: 'OPENAI',
    };
  }

  async generateStructuredOutput<T = any>(request: AIRequest, validator: (data: any) => T): Promise<AIResponse & { structuredJson: T }> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Set the environment variable to enable structured AI output.');
    }

    const jsonRequest: AIRequest = {
      ...request,
      responseFormat: 'json',
      systemInstructions: request.systemInstructions + '\n\nYou MUST respond with valid JSON only. No markdown, no commentary.',
    };

    const completion = await this.generateCompletion(jsonRequest);
    let parsed: any;
    try {
      const content = completion.content;
      // Strip markdown code fences if present
      const jsonStr = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      throw new Error('OpenAI structured output could not be parsed as JSON.');
    }

    const structuredJson = validator(parsed);
    return { ...completion, structuredJson };
  }

  async analyzeContext(context: string): Promise<string> {
    const response = await this.generateCompletion({
      systemInstructions: 'Analyze the following context and provide a concise summary.',
      userPrompt: context,
    });
    return response.content;
  }

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
    throw new Error('Anthropic adapter not yet configured. Set ANTHROPIC_API_KEY to enable.');
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
    throw new Error('Google AI adapter not yet configured. Set GOOGLE_AI_API_KEY to enable.');
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
    throw new Error('Local model adapter not yet configured. Set LOCAL_MODEL_URL to enable.');
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
