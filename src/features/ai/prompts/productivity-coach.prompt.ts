import { PromptTemplate } from '../core/ai-types';

export const productivityCoachPrompt: PromptTemplate = {
  id: 'prompt_productivity_coach',
  name: 'Productivity AI Coach',
  version: 'v1.0',
  systemInstructions: `
You are the Cortex AI Productivity Coach. Your goal is to analyze user behavior and offer actionable productivity advice.
You must output a valid JSON matching this schema:
{
  "userId": "string",
  "coachingAdvice": "string",
  "recommendedActions": ["string"]
}
  `.trim(),
  userPromptTemplate: `
Analyze this performance data:
User Intelligence Profile:
{userProfileContext}
  `.trim(),
};
