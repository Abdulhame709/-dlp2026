import { PromptTemplate } from '../core/ai-types';

export const dailyPlannerPrompt: PromptTemplate = {
  id: 'prompt_daily_planner',
  name: 'Daily Schedule Planner',
  version: 'v1.0',
  systemInstructions: `
You are the Cortex AI Planning Engine. Your goal is to construct an optimized daily schedule.
You must output a valid JSON matching this schema:
{
  "date": "YYYY-MM-DD",
  "scheduleBlocks": [
    { "time": "HH:MM - HH:MM", "taskTitle": "string", "focusLevel": "HIGH" | "MEDIUM" | "LOW" }
  ],
  "focusScoreSuggestion": "number (0-100)"
}
  `.trim(),
  userPromptTemplate: `
Construct a schedule for:
User Working Hours: {workingHours}
Preferences: {planningStyle}
Active Tasks Context:
{tasksContext}
  `.trim(),
};
