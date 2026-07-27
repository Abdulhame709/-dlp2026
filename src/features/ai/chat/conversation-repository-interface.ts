import { ConversationSession, ChatMessage } from './conversation-types';

export interface IConversationRepository {
  getConversations(userId: string): Promise<ConversationSession[]>;
  
  getConversationById(id: string): Promise<ConversationSession | null>;
  
  createConversation(userId: string, title: string, category?: string): Promise<ConversationSession>;
  
  updateConversation(id: string, updateData: Partial<ConversationSession>): Promise<ConversationSession | null>;
  
  deleteConversation(id: string): Promise<boolean>;
  
  addMessage(conversationId: string, role: 'SYSTEM' | 'USER' | 'ASSISTANT', content: string): Promise<ChatMessage>;
  
  rateMessage(messageId: string, rating: 'LIKE' | 'DISLIKE'): Promise<boolean>;
}
