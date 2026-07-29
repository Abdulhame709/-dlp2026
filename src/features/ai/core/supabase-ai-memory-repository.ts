import { AIMemoryRecord, AIMemoryType } from '../memory/memory-types';
import { createClient } from '@/core/database/connection';

export class SupabaseAIMemoryRepository {
  private mapRowToRecord(row: any): AIMemoryRecord {
    return {
      id: row.id,
      userId: row.user_id,
      memoryType: row.memory_type as AIMemoryType,
      content: row.content,
      importanceScore: row.importance_score,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async saveMemory(
    userId: string,
    memoryType: AIMemoryType,
    content: string,
    importanceScore = 5
  ): Promise<AIMemoryRecord> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_memory')
      .insert({
        user_id: userId,
        memory_type: memoryType,
        content,
        importance_score: importanceScore,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`AI_MEMORY_INSERT_FAILED: ${error?.message}`);
    }

    return this.mapRowToRecord(data);
  }

  async getMemories(userId: string, type?: AIMemoryType): Promise<AIMemoryRecord[]> {
    const supabase = await createClient();

    let query = supabase
      .from('ai_memory')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('memory_type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => this.mapRowToRecord(row));
  }

  async deleteMemory(userId: string, memoryId: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ai_memory')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);

    return !error;
  }

  async clearAllMemories(userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ai_memory')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
export type { AIMemoryRecord, AIMemoryType };
