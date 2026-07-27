import { ShortTermContext } from './memory-types';

const shortTermStore = new Map<string, ShortTermContext>();

export class ShortTermMemoryManager {
  static getSessionContext(sessionId: string): ShortTermContext {
    const existing = shortTermStore.get(sessionId);
    if (existing) return existing;

    const newContext: ShortTermContext = {
      sessionId,
      lastMessages: [],
    };
    shortTermStore.set(sessionId, newContext);
    return newContext;
  }

  static appendMessage(sessionId: string, message: string): void {
    const context = this.getSessionContext(sessionId);
    context.lastMessages.push(message);
    
    // Keep only last 10 messages to limit token context overhead
    if (context.lastMessages.length > 10) {
      context.lastMessages.shift();
    }
    shortTermStore.set(sessionId, context);
  }

  static setActiveTask(sessionId: string, taskId: string | null): void {
    const context = this.getSessionContext(sessionId);
    context.activeTaskId = taskId;
    shortTermStore.set(sessionId, context);
  }

  static clearSession(sessionId: string): void {
    shortTermStore.delete(sessionId);
  }
}
