import { IConversationRepository } from './conversation-repository-interface';
import { MockConversationRepository } from './mock-conversation-repository';
import { ConversationSession, ChatMessage } from './conversation-types';
import { EventBus } from '@/core/utils/event-bus';

export class ConversationService {
  private static repository: IConversationRepository = new MockConversationRepository();

  /**
   * Set dynamic repository implementation at runtime
   */
  static setRepository(customRepo: IConversationRepository) {
    this.repository = customRepo;
  }

  /**
   * Retrieve all conversation sessions belonging to the user
   */
  static async getUserSessions(userId: string): Promise<ConversationSession[]> {
    return this.repository.getConversations(userId);
  }

  /**
   * Retrieve single session with full message log histories
   */
  static async getSession(id: string): Promise<ConversationSession | null> {
    return this.repository.getConversationById(id);
  }

  /**
   * Initialize a new conversation session
   */
  static async startNewSession(userId: string, title: string, category?: string): Promise<ConversationSession> {
    return this.repository.createConversation(userId, title, category);
  }

  /**
   * Soft delete a conversation session
   */
  static async softDeleteSession(id: string): Promise<boolean> {
    return this.repository.deleteConversation(id);
  }

  /**
   * Archive a conversation session
   */
  static async archiveSession(id: string): Promise<ConversationSession | null> {
    return this.repository.updateConversation(id, { isArchived: true });
  }

  /**
   * Save participant messages (USER or ASSISTANT) to session logs
   */
  static async saveMessage(
    conversationId: string,
    role: 'SYSTEM' | 'USER' | 'ASSISTANT',
    content: string
  ): Promise<ChatMessage> {
    return this.repository.addMessage(conversationId, role, content);
  }

  /**
   * Rates a specific assistant message (LIKE or DISLIKE) and triggers feedback telemetry
   */
  static async rateMessage(messageId: string, rating: 'LIKE' | 'DISLIKE'): Promise<boolean> {
    const success = await this.repository.rateMessage(messageId, rating);
    if (success) {
      // Broadcast Feedback Event to feed reinforcement learning pipelines in the future
      await EventBus.publish('AI_RESPONSE_RATED', { messageId, rating });
    }
    return success;
  }
}
export type { IConversationRepository };
