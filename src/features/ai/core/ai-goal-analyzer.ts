import { z } from 'zod';
import { AIService } from './ai-service';

// 1. Goal Analysis Schema
export const goalAnalysisSchema = z.object({
  objective: z.string(),
  assumptions: z.array(z.string()),
  risks: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
    })
  ),
  requiredSkills: z.array(z.string()),
  difficulty: z.number().min(1).max(5),
  executionStrategy: z.string(),
});

// 2. Project & Milestone Generation Schema
export const projectGenerationSchema = z.object({
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      milestones: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
});

// 3. Tasks Breakdown Schema
export const tasksBreakdownSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedDuration: z.number(), // in minutes
      difficulty: z.number().min(1).max(5),
      priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
      dependencies: z.array(z.string()),
    })
  ),
});

// 4. Priority Engine Schema
export const priorityScoreSchema = z.object({
  priorityScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
});

// 5. Timeline Generation Schema
export const timelineSchema = z.object({
  weeks: z.array(
    z.object({
      weekNumber: z.number(),
      targetDate: z.string(),
      tasks: z.array(z.string()),
    })
  ),
});

export class AIGoalAnalyzer {
  /**
   * Generates structural Goal Analysis
   */
  static async analyzeGoal(userId: string, title: string, description = ''): Promise<z.infer<typeof goalAnalysisSchema>> {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Goal Analyzer. Analyze the goal and return risks, assumptions, difficulty, and skills required.',
        userPrompt: `Goal Title: ${title}\nDescription: ${description}`,
        responseFormat: 'json',
      },
      (data) => goalAnalysisSchema.parse(data)
    );
    return response.structuredJson;
  }

  /**
   * Automatically decomposes a Goal into parent Projects and Milestones
   */
  static async generateProjects(userId: string, goalTitle: string): Promise<z.infer<typeof projectGenerationSchema>> {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Project Generator. Decompose this goal into 3-5 distinct Projects containing specific milestones.',
        userPrompt: `Goal: ${goalTitle}`,
        responseFormat: 'json',
      },
      (data) => projectGenerationSchema.parse(data)
    );
    return response.structuredJson;
  }

  /**
   * Decomposes a Milestone into concrete executable Tasks
   */
  static async breakdownMilestoneTasks(userId: string, milestoneTitle: string): Promise<z.infer<typeof tasksBreakdownSchema>> {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Task Generator. Breakdown this milestone into a list of 3 actionable tasks.',
        userPrompt: `Milestone: ${milestoneTitle}`,
        responseFormat: 'json',
      },
      (data) => tasksBreakdownSchema.parse(data)
    );
    return response.structuredJson;
  }

  /**
   * Computes Priority Scores based on urgency, importance, and dependency weights
   */
  static async calculatePriority(
    userId: string,
    taskTitle: string,
    urgency: number,
    importance: number
  ): Promise<z.infer<typeof priorityScoreSchema>> {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Priority Engine. Calculate a priority score out of 100 based on urgency and importance.',
        userPrompt: `Task: ${taskTitle}\nUrgency: ${urgency}/10\nImportance: ${importance}/10`,
        responseFormat: 'json',
      },
      (data) => priorityScoreSchema.parse(data)
    );
    return response.structuredJson;
  }

  /**
   * Automatically generates an execution timeline over weekly blocks
   */
  static async generateTimeline(userId: string, taskTitles: string[]): Promise<z.infer<typeof timelineSchema>> {
    const response = await AIService.generateStructuredOutput(
      userId,
      {
        systemInstructions: 'You are the Cortex AI Timeline Generator. Schedule these tasks into weekly blocks.',
        userPrompt: `Tasks list: ${taskTitles.join(', ')}`,
        responseFormat: 'json',
      },
      (data) => timelineSchema.parse(data)
    );
    return response.structuredJson;
  }
}
export type GoalAnalysis = z.infer<typeof goalAnalysisSchema>;
export type GeneratedProject = z.infer<typeof projectGenerationSchema>;
export type GeneratedTasks = z.infer<typeof tasksBreakdownSchema>;
export type PriorityScore = z.infer<typeof priorityScoreSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
