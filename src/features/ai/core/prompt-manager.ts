import { PromptTemplate } from './ai-types';

export class PromptManager {
  /**
   * Replaces variables placeholders inside user prompts safely
   */
  static render(
    template: PromptTemplate,
    variables: Record<string, string>
  ): { system: string; user: string } {
    let renderedUserPrompt = template.userPromptTemplate;

    Object.entries(variables).forEach(([key, value]) => {
      renderedUserPrompt = renderedUserPrompt.replace(
        new RegExp(`{${key}}`, 'g'),
        value || ''
      );
    });

    return {
      system: template.systemInstructions,
      user: renderedUserPrompt,
    };
  }
}
