import { env } from './env';

// Existing wired repositories
import { ITaskRepository } from '@/features/tasks/repositories/task-repository-interface';
import { MockTaskRepository } from '@/features/tasks/repositories/mock-task-repository';

import { ISettingsRepository } from '@/features/settings/settings-repository-interface';
import { MockSettingsRepository } from '@/features/settings/mock-settings-repository';

import { IConversationRepository } from '@/features/ai/chat/conversation-repository-interface';
import { MockConversationRepository } from '@/features/ai/chat/mock-conversation-repository';

import { IProjectRepository } from '@/features/projects/repositories/project-repository-interface';
import { MockProjectRepository } from '@/features/projects/repositories/mock-project-repository';

import { IGoalRepository } from '@/features/goals/repositories/goal-repository-interface';
import { MockGoalRepository } from '@/features/goals/repositories/mock-goal-repository';

// Newly wired repositories
import { IAnalyticsRepository } from '@/features/analytics/analytics-repository-interface';
import { MockAnalyticsRepository } from '@/features/analytics/mock-analytics-repository';

import { INotificationRepository } from '@/features/notifications/notification-repository-interface';
import { MockNotificationRepository } from '@/features/notifications/mock-notification-repository';

import { IBillingRepository } from '@/features/billing/billing-repository-interface';
import { MockBillingRepository } from '@/features/billing/mock-billing-repository';

import { IAIMemoryRepository } from '@/features/ai/memory/memory-repository-interface';
import { MockAIMemoryRepository } from '@/features/ai/memory/mock-memory-repository';

import { IOrganizationRepository } from '@/features/organizations/repositories/organization-repository-interface';
import { MockOrganizationRepository } from '@/features/organizations/repositories/mock-organization-repository';

export class DependencyInjector {
  // ──────────────────────────────────────────────────────────
  // Already wired repositories (Step 1)
  // ──────────────────────────────────────────────────────────

  /**
   * Dynamically resolves the active Task Repository implementation
   */
  static getTaskRepository(): ITaskRepository {
    if (env.useMock) {
      return new MockTaskRepository();
    }
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

  /**
   * Dynamically resolves the active Goal Repository implementation
   */
  static getGoalRepository(): IGoalRepository {
    if (env.useMock) {
      return new MockGoalRepository();
    }
    const { SupabaseGoalRepository } = require('@/features/goals/repositories/supabase-goal-repository');
    return new SupabaseGoalRepository();
  }

  // ──────────────────────────────────────────────────────────
  // Step 2 — Newly wired repositories
  // ──────────────────────────────────────────────────────────

  /**
   * Dynamically resolves the active Analytics Repository implementation
   */
  static getAnalyticsRepository(): IAnalyticsRepository {
    if (env.useMock) {
      return new MockAnalyticsRepository();
    }
    const { SupabaseAnalyticsRepository } = require('@/features/analytics/supabase-analytics-repository');
    return new SupabaseAnalyticsRepository();
  }

  /**
   * Dynamically resolves the active Notification Repository implementation
   */
  static getNotificationRepository(): INotificationRepository {
    if (env.useMock) {
      return new MockNotificationRepository();
    }
    const { SupabaseNotificationRepository } = require('@/features/notifications/supabase-notification-repository');
    return new SupabaseNotificationRepository();
  }

  /**
   * Dynamically resolves the active Billing Repository implementation
   */
  static getBillingRepository(): IBillingRepository {
    if (env.useMock) {
      return new MockBillingRepository();
    }
    const { SupabaseBillingRepository } = require('@/features/billing/supabase-billing-repository');
    return new SupabaseBillingRepository();
  }

  /**
   * Dynamically resolves the active AI Memory Repository implementation
   */
  static getAIMemoryRepository(): IAIMemoryRepository {
    if (env.useMock) {
      return new MockAIMemoryRepository();
    }
    const { SupabaseAIMemoryRepository } = require('@/features/ai/core/supabase-ai-memory-repository');
    return new SupabaseAIMemoryRepository();
  }

  /**
   * Dynamically resolves the active Organization Repository implementation
   */
  static getOrganizationRepository(): IOrganizationRepository {
    if (env.useMock) {
      return new MockOrganizationRepository();
    }
    const { SupabaseOrganizationRepository } = require('@/features/organizations/repositories/supabase-organization-repository');
    return new SupabaseOrganizationRepository();
  }
}
