import { AIMemoryRecord, AIMemoryType } from './memory-types';

export interface IAIMemoryRepository {
  saveMemory(
    userId: string,
    memoryType: AIMemoryType,
    content: string,
    importanceScore?: number
  ): Promise<AIMemoryRecord>;

  getMemories(userId: string, type?: AIMemoryType): Promise<AIMemoryRecord[]>;

  deleteMemory(userId: string, memoryId: string): Promise<boolean>;

  clearAllMemories(userId: string): Promise<void>;
}
