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

    // 1. Match Goal Analyzer
    if (system.includes('goal analyzer')) {
      mockData = {
        objective: 'Establish a production-ready cloud SaaS platform in 3 months.',
        assumptions: [
          'Development team has strict TypeScript knowledge.',
          'Database layer is built on Supabase/PostgreSQL.'
        ],
        risks: [
          { risk: 'Database connection leakage', mitigation: 'Enable strict Row Level Security (RLS) policies.' },
          { risk: 'Token cost inflation', mitigation: 'Configure a daily token budget in the AI Gateway.' }
        ],
        requiredSkills: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Supabase RLS', 'Prompt Engineering'],
        difficulty: 4,
        executionStrategy: 'Phase 0 setup first, then deploy database schemas, then integrate auth middleware before building UI pages.',
      };
    }
    // 2. Match Project Generator
    else if (system.includes('project generator')) {
      mockData = {
        projects: [
          {
            name: 'Core System Infrastructure',
            description: 'Tearing down mock boundaries and deploying PostgreSQL schemas.',
            milestones: [
              { title: 'Schema Migration', description: 'Deploy tables and primary indices.' },
              { title: 'RLS Security', description: 'Apply Row-Level Security isolation rules.' }
            ]
          },
          {
            name: 'Intelligent AI Schedulers',
            description: 'Building the planning gateway and context compilers.',
            milestones: [
              { title: 'AI Gateway', description: 'Enable multi-model adapters routing.' },
              { title: 'Planner Engine', description: 'Compute calendar timeline block allocations.' }
            ]
          }
        ]
      };
    }
    // 3. Match Task Generator / Milestone Breakdowns
    else if (system.includes('task generator')) {
      mockData = {
        tasks: [
          {
            title: 'Deploy PostgreSQL tables on Supabase',
            description: 'Generate and deploy SQL migration files using Prisma.',
            estimatedDuration: 180,
            difficulty: 3,
            priority: 'HIGH',
            dependencies: [],
          },
          {
            title: 'Audit Row Level Security policies',
            description: 'Simulate User A vs User B sessions inside isolated SQL transactions.',
            estimatedDuration: 120,
            difficulty: 4,
            priority: 'CRITICAL',
            dependencies: ['Deploy PostgreSQL tables on Supabase'],
          }
        ]
      };
    }
    // 4. Match Priority Engine (Merged to satisfy BOTH older and newer schemas simultaneously)
    else if (system.includes('priority engine')) {
      mockData = {
        // Schema 1 fields (Phase 3A/3B prioritisation)
        taskId: '66666666-6666-6666-6666-666666666661',
        suggestedPriority: 'CRITICAL',
        score: 95,
        reasoning: 'The task blocks critical database deployment pipelines and is marked as urgent.',
        
        // Schema 2 fields (Build Cycle 1 priority score)
        priorityScore: 92,
        confidence: 96,
        reason: 'The task blocks critical database deployment pipelines and is marked as urgent.',
      };
    }
    // 5. Match Timeline Generator
    else if (system.includes('timeline generator')) {
      mockData = {
        weeks: [
          { weekNumber: 1, targetDate: 'Week of Aug 3', tasks: ['Deploy PostgreSQL tables', 'Setup Auth Provider'] },
          { weekNumber: 2, targetDate: 'Week of Aug 10', tasks: ['Audit RLS policies', 'Integrate AI Schedulers'] },
        ]
      };
    }
    // 6. Match other structured output tasks (Daily Planner, etc.)
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
