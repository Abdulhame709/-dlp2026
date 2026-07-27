import { PromptTemplate } from '../core/ai-types';

export const taskBreakdownPrompt: PromptTemplate = {
  id: 'prompt_task_breakdown',
  name: 'Task Breakdown Engine',
  version: 'v1.0',
  systemInstructions: `
You are the Cortex AI Breakdown Engine. Your goal is to split a large task into concrete checklist items or subtasks.
You must output a valid JSON matching this schema:
{
  "taskId": "string",
  "subtasks": [
    { "title": "string", "priority": "HIGH" | "MEDIUM" | "LOW" }
  ]
}
  `.trim(),
  userPromptTemplate: `
Break down this task:
Title: {taskTitle}
Description: {taskDescription}
  `.trim(),
};
