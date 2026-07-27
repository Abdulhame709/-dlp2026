import { ConversationSession, ChatMessage } from './conversation-types';
import { IConversationRepository } from './conversation-repository-interface';

// Local in-memory store for active conversations and messages
const mockConversationsTable: ConversationSession[] = [
  {
    id: 'session-default-1',
    userId: '11111111-1111-1111-1111-111111111111',
    title: 'Cortex AI Roadmap Brief',
    category: 'AI Planning',
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  }
];

const mockMessagesTable: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    conversationId: 'session-default-1',
    role: 'USER',
    content: 'Explain what makes Cortex AI different from static task managers.',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'msg-seed-2',
    conversationId: 'session-default-1',
    role: 'ASSISTANT',
    content: 'Traditional task managers act as mere databases. Cortex AI is an active AI-native Productivity OS that automates planning, updates schedules on delay, and optimizes execution natively.',
    createdAt: new Date(Date.now() - 86400000 * 2 + 1000),
  }
];

export class MockConversationRepository implements IConversationRepository {
  async getConversations(userId: string): Promise<ConversationSession[]> {
    const list = mockConversationsTable.filter(c => c.userId === userId && !c.deletedAt);
    
    // Attach message payloads recursively
    return list.map(c => ({
      ...c,
      messages: mockMessagesTable.filter(m => m.conversationId === c.id),
    }));
  }

  async getConversationById(id: string): Promise<ConversationSession | null> {
    const session = mockConversationsTable.find(c => c.id === id && !c.deletedAt);
    if (!session) return null;

    return {
      ...session,
      messages: mockMessagesTable.filter(m => m.conversationId === id),
    };
  }

  async createConversation(userId: string, title: string, category = 'General'): Promise<ConversationSession> {
    const newSession: ConversationSession = {
      id: `session-uuid-${Date.now()}`,
      userId,
      title,
      category,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockConversationsTable.push(newSession);
    return newSession;
  }

  async updateConversation(id: string, updateData: Partial<ConversationSession>): Promise<ConversationSession | null> {
    const index = mockConversationsTable.findIndex(c => c.id === id && !c.deletedAt);
    if (index === -1) return null;

    const updated = {
      ...mockConversationsTable[index],
      ...updateData,
      updatedAt: new Date(),
    };

    mockConversationsTable[index] = updated;
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const index = mockConversationsTable.findIndex(c => c.id === id && !c.deletedAt);
    if (index === -1) return false;

    // Apply soft-delete
    mockConversationsTable[index].deletedAt = new Date();
    mockConversationsTable[index].updatedAt = new Date();
    return true;
  }

  async addMessage(conversationId: string, role: 'SYSTEM' | 'USER' | 'ASSISTANT', content: string): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: `msg-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };

    mockMessagesTable.push(newMessage);
    return newMessage;
  }

  async rateMessage(messageId: string, rating: 'LIKE' | 'DISLIKE'): Promise<boolean> {
    const index = mockMessagesTable.findIndex(m => m.id === messageId);
    if (index === -1) return false;

    mockMessagesTable[index].rating = rating;
    return true;
  }
}
export { mockConversationsTable, mockMessagesTable };
