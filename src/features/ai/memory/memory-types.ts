export type AIMemoryType = 'PREFERENCE' | 'GOAL' | 'WORK_PATTERN' | 'BEHAVIOR';

export interface AIMemoryRecord {
  id: string;
  userId: string;
  memoryType: AIMemoryType;
  content: string;
  importanceScore: number; // 0 to 10
  createdAt: Date;
  updatedAt: Date;
}

export interface ShortTermContext {
  sessionId: string;
  lastMessages: string[];
  activeTaskId?: string | null;
}
