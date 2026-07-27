import { IAIProvider } from './ai-provider-interface';
import { AIRequest, AIResponse } from './ai-types';

export class MockAIProvider implements IAIProvider {
  private modelName = 'cortex-mock-intelligence-v1';

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    const isJson = request.responseFormat === 'json';
    const content = isJson 
      ? JSON.stringify({ reply: 'Mock JSON completion generated.' })
      : `Mock AI text response for prompt: "${request.userPrompt.substring(0, 40)}..."`;

    return {
      content,
      tokenUsage: {
        promptTokens: this.estimateTokens(request.userPrompt),
        completionTokens: this.estimateTokens(content),
        totalTokens: this.estimateTokens(request.userPrompt) + this.estimateTokens(content),
      },
      modelName: this.modelName,
      providerName: 'MOCK',
    };
  }

  async generateStructuredOutput<T = any>(
    request: AIRequest,
    validator: (data: any) => T
  ): Promise<AIResponse & { structuredJson: T }> {
    let mockData: any = {};

    const system = (request.systemInstructions || '').toLowerCase();

    // 1. Match Task Prioritization Engine
    if (system.includes('priority engine')) {
      mockData = {
        taskId: '66666666-6666-6666-6666-666666666661',
        suggestedPriority: 'CRITICAL',
        score: 95,
        reasoning: 'High organization impact + close deadline on DB schema.',
      };
    } 
    // 2. Match Daily Planner Engine
    else if (system.includes('planning engine')) {
      mockData = {
        date: new Date().toISOString().split('T')[0],
        scheduleBlocks: [
          { time: '09:00 - 11:00', taskTitle: 'Deploy Database Schema with RLS', focusLevel: 'HIGH' },
          { time: '13:00 - 14:00', taskTitle: 'Setup GitHub Actions CI/CD', focusLevel: 'MEDIUM' },
        ],
        focusScoreSuggestion: 88,
      };
    } 
    // 3. Match Task Breakdown Engine
    else if (system.includes('breakdown engine')) {
      mockData = {
        taskId: '66666666-6666-6666-6666-666666666661',
        subtasks: [
          { title: 'Collect financial tax declarations', priority: 'HIGH' },
          { title: 'Audit preceding ledger statements', priority: 'CRITICAL' },
          { title: 'Assemble executive brief', priority: 'MEDIUM' },
        ],
      };
    } 
    // 4. Default: Productivity Coach
    else {
      mockData = {
        userId: '11111111-1111-1111-1111-111111111111',
        coachingAdvice: 'You completed critical tasks 1.4x faster before noon this week. Reschedule administrative tasks to late afternoon blocks to preserve morning focus.',
        recommendedActions: ['Move non-essential meetings to Tuesdays', 'Block 9-12 AM daily for deep focus'],
      };
    }

    // Validate structured output before returning
    const structuredJson = validator(mockData);

    const content = JSON.stringify(structuredJson);

    return {
      content,
      structuredJson,
      tokenUsage: {
        promptTokens: this.estimateTokens(request.userPrompt),
        completionTokens: this.estimateTokens(content),
        totalTokens: this.estimateTokens(request.userPrompt) + this.estimateTokens(content),
      },
      modelName: this.modelName,
      providerName: 'MOCK',
    };
  }

  async analyzeContext(context: string): Promise<string> {
    return `Mock analytical synthesis for context size: ${context.length} characters.`;
  }

  estimateTokens(text: string): number {
    return Math.max(1, Math.round(text.length / 4));
  }
}
