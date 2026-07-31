import { AIRequest, AIResponse } from './ai-types';

export interface IAIProvider {
  generateCompletion(request: AIRequest): Promise<AIResponse>;
  
  generateStructuredOutput<T = any>(
    request: AIRequest,
    validator: (data: any) => T
  ): Promise<AIResponse & { structuredJson: T }>;

  analyzeContext(context: string): Promise<string>;
  
  estimateTokens(text: string): number;
}
