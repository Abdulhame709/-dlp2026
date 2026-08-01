import { IAIMemoryRepository } from './memory-repository-interface';
import { AIMemoryRecord, AIMemoryType } from './memory-types';
import { DependencyInjector } from '@/core/config/dependency-injector';

export class LongTermMemoryManager {
  // Dynamic getter handles dependency injection (DI) based on environment
  private static get repository(): IAIMemoryRepository {
    return DependencyInjector.getAIMemoryRepository();
  }

  static async saveMemory(
    userId: string,
    memoryType: AIMemoryType,
    content: string,
    importanceScore = 5
  ): Promise<AIMemoryRecord> {
    const record = await this.repository.saveMemory(userId, memoryType, content, importanceScore);

    console.log(`🧠 AI Long-Term Memory Saved [${memoryType}]: "${content}" (Score: ${importanceScore})`);
    return record;
  }

  static async getMemories(userId: string, type?: AIMemoryType): Promise<AIMemoryRecord[]> {
    return this.repository.getMemories(userId, type);
  }

  static async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    return this.repository.deleteMemory(userId, memoryId);
  }

  static async clearAllMemories(userId: string): Promise<void> {
    return this.repository.clearAllMemories(userId);
  }
}
