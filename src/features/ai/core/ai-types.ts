export type AIProviderName = 'OPENAI' | 'ANTHROPIC' | 'GEMINI' | 'MOCK';

export interface AIModelConfig {
  provider: AIProviderName;
  modelName: string;
  temperature: number;
  maxTokens: number;
}

export interface AIRequest {
  systemInstructions: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse {
  content: string;
  structuredJson?: any; // Parsed Zod output
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelName: string;
  providerName: AIProviderName;
}

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  systemInstructions: string;
  userPromptTemplate: string;
}
