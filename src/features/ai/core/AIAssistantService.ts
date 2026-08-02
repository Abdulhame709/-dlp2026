import { z } from 'zod';
import { AIService } from './ai-service';
import { PromptManager } from './prompt-manager';
import { AIContextManager } from './context-manager';
import { taskPrioritizationPrompt } from '../prompts/task-prioritization.prompt';
import { dailyPlannerPrompt } from '../prompts/daily-planner.prompt';
import { productivityCoachPrompt } from '../prompts/productivity-coach.prompt';
import { taskBreakdownPrompt } from '../prompts/task-summary.prompt';

// Zod Validation Schemas to prevent hallucinated structures
export const prioritizationSchema = z.object({
  taskId: z.string(),
  suggestedPriority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  score: z.number().min(0).max(100),
  reasoning: z.string().min(2),
});

export const dailyPlanSchema = z.object({
  date: z.string(),
  scheduleBlocks: z.array(
    z.object({
      time: z.string(),
      taskTitle: z.string(),
      focusLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })
  ),
  focusScoreSuggestion: z.number().min(0).max(100),
});

export const breakdownSchema = z.object({
  taskId: z.string(),
  subtasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    })
  ),
});

export const coachSchema = z.object({
  userId: z.string(),
  coachingAdvice: z.string(),
  recommendedActions: z.array(z.string()),
});

// AI Task Intelligence Schema
export const taskIntelligenceSchema = z.object({
  betterDescription: z.string(),
  suggestedPriority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  suggestedDuration: z.number(), // in minutes
  riskAssessment: z.string(),
});

export class AIAssistantService {
  /**
   * 1. AI Task Prioritization: Computes task execution order
   */
  static async prioritizeTask(
    userId: string,
    taskId: string,
    taskTitle: string,
    description = ''
  ) {
    const rendered = PromptManager.render(taskPrioritizationPrompt, {
      taskTitle,
      taskDescription: description,
      goalContext: 'Launch Cortex AI MVP to organic beta users.',
      analyticsBehavior: 'User completes critical tasks 1.4x faster before noon.',
    });

    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: rendered.system,
        userPrompt: rendered.user,
        responseFormat: 'json',
      },
      (data) => prioritizationSchema.parse(data)
    );

    return response.structuredJson;
  }

  /**
   * 2. AI Daily Planner: Computes optimized calendar schedule
   */
  static async generateDailyPlan(userId: string) {
    const contexts = await AIContextManager.compileFullContext(userId);

    const rendered = PromptManager.render(dailyPlannerPrompt, {
      workingHours: '09:00 - 17:00 Yemen Time',
      planningStyle: 'Deep morning focus sessions preferred.',
      tasksContext: contexts.activeTasks,
    });

    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: rendered.system,
        userPrompt: rendered.user,
        responseFormat: 'json',
      },
      (data) => dailyPlanSchema.parse(data)
    );

    return response.structuredJson;
  }

  /**
   * 3. AI Task Breakdown: Splitting complex tasks into checklists
   */
  static async breakdownTask(userId: string, taskId: string, taskTitle: string, description = '') {
    const rendered = PromptManager.render(taskBreakdownPrompt, {
      taskTitle,
      taskDescription: description,
    });

    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: rendered.system,
        userPrompt: rendered.user,
        responseFormat: 'json',
      },
      (data) => breakdownSchema.parse(data)
    );

    return response.structuredJson;
  }

  /**
   * 4. AI Productivity Coach: Behavioral advice based on telemetry
   *    Accepts optional userMessage to include the user's actual prompt in the context.
   */
  static async getCoachingAdvice(userId: string, userMessage?: string) {
    const contexts = await AIContextManager.compileFullContext(userId);

    const rendered = PromptManager.render(productivityCoachPrompt, {
      userProfileContext: contexts.userProfile,
      userMessage: userMessage || '',
    });

    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: rendered.system,
        userPrompt: rendered.user,
        responseFormat: 'json',
      },
      (data) => coachSchema.parse(data)
    );

    return response.structuredJson;
  }

  /**
   * 5. AI Task Intelligence: Analyzes and enhances task metadata
   */
  static async analyzeTaskIntelligence(userId: string, taskTitle: string, description = '') {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Task Intelligence Engine. Analyze this task and suggest improvements: better description, suggested priority, duration estimate, and potential risk warnings.',
        userPrompt: `Task: ${taskTitle}\nDescription: ${description}`,
        responseFormat: 'json',
      },
      (data) => taskIntelligenceSchema.parse(data)
    );

    return response.structuredJson;
  }
}
