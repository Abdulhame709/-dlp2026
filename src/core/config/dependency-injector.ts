import { env } from './env';
import { ITaskRepository } from '@/features/tasks/repositories/task-repository-interface';
import { MockTaskRepository } from '@/features/tasks/repositories/mock-task-repository';

import { ISettingsRepository } from '@/features/settings/settings-repository-interface';
import { MockSettingsRepository } from '@/features/settings/mock-settings-repository';

import { IConversationRepository } from '@/features/ai/chat/conversation-repository-interface';
import { MockConversationRepository } from '@/features/ai/chat/mock-conversation-repository';

import { IProjectRepository } from '@/features/projects/repositories/project-repository-interface';
import { MockProjectRepository } from '@/features/projects/repositories/mock-project-repository';

export class DependencyInjector {
  /**
   * Dynamically resolves the active Task Repository implementation
   */
  static getTaskRepository(): ITaskRepository {
    if (env.useMock) {
      return new MockTaskRepository();
    }
    // Dynamically load production adapter to isolate server-only modules from client bundles
    const { SupabaseTaskRepository } = require('@/features/tasks/repositories/supabase-task-repository');
    return new SupabaseTaskRepository();
  }

  /**
   * Dynamically resolves the active Settings Repository implementation
   */
  static getSettingsRepository(): ISettingsRepository {
    if (env.useMock) {
      return new MockSettingsRepository();
    }
    const { SupabaseSettingsRepository } = require('@/features/settings/supabase-settings-repository');
    return new SupabaseSettingsRepository();
  }

  /**
   * Dynamically resolves the active Conversation Repository implementation
   */
  static getConversationRepository(): IConversationRepository {
    if (env.useMock) {
      return new MockConversationRepository();
    }
    const { SupabaseConversationRepository } = require('@/features/ai/chat/supabase-conversation-repository');
    return new SupabaseConversationRepository();
  }

  /**
   * Dynamically resolves the active Project Repository implementation
   */
  static getProjectRepository(): IProjectRepository {
    if (env.useMock) {
      return new MockProjectRepository();
    }
    const { SupabaseProjectRepository } = require('@/features/projects/repositories/supabase-project-repository');
    return new SupabaseProjectRepository();
  }
}
