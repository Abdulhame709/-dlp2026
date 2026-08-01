import { IAIMemoryRepository } from './memory-repository-interface';
import { AIMemoryRecord, AIMemoryType } from './memory-types';

// Local in-memory store for development/testing
const mockLongTermStore = new Map<string, AIMemoryRecord[]>();

export class MockAIMemoryRepository implements IAIMemoryRepository {
  async saveMemory(
    userId: string,
    memoryType: AIMemoryType,
    content: string,
    importanceScore = 5
  ): Promise<AIMemoryRecord> {
    const userMemories = mockLongTermStore.get(userId) || [];

    const newRecord: AIMemoryRecord = {
      id: `mem-uuid-${Date.now()}`,
      userId,
      memoryType,
      content,
      importanceScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userMemories.push(newRecord);
    mockLongTermStore.set(userId, userMemories);

    return newRecord;
  }

  async getMemories(userId: string, type?: AIMemoryType): Promise<AIMemoryRecord[]> {
    const userMemories = mockLongTermStore.get(userId) || [];
    if (type) {
      return userMemories.filter(m => m.memoryType === type);
    }
    return userMemories;
  }

  async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    const userMemories = mockLongTermStore.get(userId) || [];
    const index = userMemories.findIndex(m => m.id === memoryId);

    if (index === -1) return false;
    userMemories.splice(index, 1);
    mockLongTermStore.set(userId, userMemories);
    return true;
  }

  async clearAllMemories(userId: string): Promise<void> {
    mockLongTermStore.delete(userId);
  }
}
