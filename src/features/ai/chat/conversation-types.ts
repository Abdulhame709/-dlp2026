export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'SYSTEM' | 'USER' | 'ASSISTANT';
  content: string;
  createdAt: Date;
  rating?: 'LIKE' | 'DISLIKE' | null;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  category?: string; // e.g. "Work", "Personal", "AI Planning"
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  messages?: ChatMessage[];
}
