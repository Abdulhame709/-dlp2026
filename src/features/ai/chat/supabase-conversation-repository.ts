import { IConversationRepository } from './conversation-repository-interface';
import { ConversationSession, ChatMessage } from './conversation-types';
import { createClient } from '@/core/database/server';

export class SupabaseConversationRepository implements IConversationRepository {
  private mapRowToSession(row: any, messages: ChatMessage[] = []): ConversationSession {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      category: row.category,
      isArchived: row.is_archived || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      messages,
    };
  }

  private mapRowToMessage(row: any): ChatMessage {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      createdAt: new Date(row.created_at),
      rating: row.rating,
    };
  }

  async getConversations(userId: string): Promise<ConversationSession[]> {
    const supabase = await createClient();

    // 1. Fetch sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (sessionsError) throw new Error(sessionsError.message);
    if (!sessionsData || sessionsData.length === 0) return [];

    // 2. Fetch messages belonging to these sessions
    const sessionIds = sessionsData.map((s) => s.id);
    const { data: messagesData, error: messagesError } = await supabase
      .from('ai_messages')
      .select('*')
      .in('conversation_id', sessionIds)
      .order('created_at', { ascending: true });

    if (messagesError) throw new Error(messagesError.message);

    const messages = (messagesData || []).map((m) => this.mapRowToMessage(m));

    return sessionsData.map((sessionRow) => {
      const sessionMessages = messages.filter((m) => m.conversationId === sessionRow.id);
      return this.mapRowToSession(sessionRow, sessionMessages);
    });
  }

  async getConversationById(id: string): Promise<ConversationSession | null> {
    const supabase = await createClient();

    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (sessionError || !sessionData) return null;

    const { data: messagesData, error: messagesError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw new Error(messagesError.message);

    const messages = (messagesData || []).map((m) => this.mapRowToMessage(m));
    return this.mapRowToSession(sessionData, messages);
  }

  async createConversation(userId: string, title: string, category = 'General'): Promise<ConversationSession> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title,
        category,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`CONVERSATION_INSERT_FAILED: ${error?.message}`);
    return this.mapRowToSession(data);
  }

  async updateConversation(id: string, updateData: Partial<ConversationSession>): Promise<ConversationSession | null> {
    const supabase = await createClient();

    const dbRow: Record<string, any> = {};
    if (updateData.title !== undefined) dbRow.title = updateData.title;
    if (updateData.isArchived !== undefined) dbRow.is_archived = updateData.isArchived;

    const { data, error } = await supabase
      .from('ai_conversations')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return this.mapRowToSession(data);
  }

  async deleteConversation(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ai_conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }

  async addMessage(conversationId: string, role: 'SYSTEM' | 'USER' | 'ASSISTANT', content: string): Promise<ChatMessage> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error || !data) throw new Error(`MESSAGE_INSERT_FAILED: ${error?.message}`);
    return this.mapRowToMessage(data);
  }

  async rateMessage(messageId: string, rating: 'LIKE' | 'DISLIKE'): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ai_messages')
      .update({ rating })
      .eq('id', messageId);

    return !error;
  }
}
export type { IConversationRepository };
