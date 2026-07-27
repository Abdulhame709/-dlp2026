import { PromptTemplate } from '../core/ai-types';

export const taskPrioritizationPrompt: PromptTemplate = {
  id: 'prompt_task_prioritization',
  name: 'Task Prioritization Agent',
  version: 'v1.0',
  systemInstructions: `
You are the Cortex AI Priority Engine. Your goal is to analyze task metadata and compute a logical priority.
You must output a valid JSON matching this schema:
{
  "taskId": "string",
  "suggestedPriority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "score": "number (0-100)",
  "reasoning": "string explaining the priority decision"
}
  `.trim(),
  userPromptTemplate: `
Please analyze this task:
Task Title: {taskTitle}
Description: {taskDescription}
Goal Context: {goalContext}
Analytics Behavior: {analyticsBehavior}
  `.trim(),
};
