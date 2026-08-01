-- =====================================================================
-- Cortex AI — Phase 10 Step 1: Add 6 Missing Production Tables
-- =====================================================================
-- Tables: ai_conversations, ai_messages, ai_memory,
--         notifications, subscriptions, audit_logs
--
-- All tables follow the exact patterns established in the init migration:
--   - UUID primary keys with gen_random_uuid()
--   - Foreign keys to profiles(id) with appropriate ON DELETE
--   - Audit fields (created_at, updated_at) with auto-update triggers
--   - Soft delete (deleted_at) where applicable
--   - Row Level Security (RLS) with user/org isolation
--   - Performance indexes aligned with repository query patterns
-- =====================================================================

-- =====================================================================
-- 1. ai_conversations — Persistent AI chat sessions
-- =====================================================================
-- Repository: src/features/ai/chat/supabase-conversation-repository.ts
-- Expected columns: id, user_id, title, category, is_archived,
--                   created_at, updated_at, deleted_at
-- =====================================================================

CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Register update trigger for ai_conversations
CREATE TRIGGER trigger_update_ai_conversations_timestamp
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- Indexes aligned with repository query patterns
CREATE INDEX idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_user_not_deleted ON public.ai_conversations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ai_conversations_org ON public.ai_conversations(organization_id);
CREATE INDEX idx_ai_conversations_created ON public.ai_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- ai_conversations RLS Policies
-- User can only see their own conversations (or org-scoped ones)
CREATE POLICY ai_conversations_select ON public.ai_conversations FOR SELECT TO authenticated USING (
    (user_id = auth.uid())
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);
CREATE POLICY ai_conversations_insert ON public.ai_conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_conversations_update ON public.ai_conversations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY ai_conversations_delete ON public.ai_conversations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================================
-- 2. ai_messages — Messages within AI chat sessions
-- =====================================================================
-- Repository: src/features/ai/chat/supabase-conversation-repository.ts
-- Expected columns: id, conversation_id, role, content, rating, created_at
-- =====================================================================

CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SYSTEM', 'USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    rating VARCHAR(10) CHECK (rating IN ('LIKE', 'DISLIKE') OR rating IS NULL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes aligned with repository query patterns
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON public.ai_messages(conversation_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- ai_messages RLS Policies
-- User can only see messages in conversations they own
-- Uses a subquery to check conversation ownership (avoids RLS recursion)
CREATE POLICY ai_messages_select ON public.ai_messages FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
        AND (ai_conversations.user_id = auth.uid()
             OR (ai_conversations.organization_id IS NOT NULL AND public.is_org_member(ai_conversations.organization_id)))
        AND ai_conversations.deleted_at IS NULL
    )
);
CREATE POLICY ai_messages_insert ON public.ai_messages FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
);
CREATE POLICY ai_messages_update ON public.ai_messages FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    )
);

-- =====================================================================
-- 3. ai_memory — Long-term AI memory records per user
-- =====================================================================
-- Repository: src/features/ai/core/supabase-ai-memory-repository.ts
-- Expected columns: id, user_id, memory_type, content, importance_score,
--                   created_at, updated_at
-- =====================================================================

CREATE TABLE public.ai_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL CHECK (memory_type IN ('PREFERENCE', 'GOAL', 'WORK_PATTERN', 'BEHAVIOR')),
    content TEXT NOT NULL,
    importance_score INTEGER NOT NULL DEFAULT 5 CHECK (importance_score >= 0 AND importance_score <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Register update trigger for ai_memory
CREATE TRIGGER trigger_update_ai_memory_timestamp
    BEFORE UPDATE ON public.ai_memory
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- Indexes aligned with repository query patterns
CREATE INDEX idx_ai_memory_user ON public.ai_memory(user_id);
CREATE INDEX idx_ai_memory_user_type ON public.ai_memory(user_id, memory_type);
CREATE INDEX idx_ai_memory_importance ON public.ai_memory(user_id, importance_score DESC);
CREATE INDEX idx_ai_memory_org ON public.ai_memory(organization_id);

-- Enable RLS
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

-- ai_memory RLS Policies
CREATE POLICY ai_memory_select ON public.ai_memory FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY ai_memory_insert ON public.ai_memory FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY ai_memory_update ON public.ai_memory FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY ai_memory_delete ON public.ai_memory FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================================
-- 4. notifications — User notification feed
-- =====================================================================
-- Repository: src/features/notifications/supabase-notification-repository.ts
-- Expected columns: id, user_id, title, message, type, read_status,
--                   action_url, created_at
-- =====================================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'ALERT' CHECK (type IN ('REMINDER', 'AI_SUGGESTION', 'ALERT', 'TEAM')),
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes aligned with repository query patterns
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read_status = FALSE;
CREATE INDEX idx_notifications_org ON public.notifications(organization_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- notifications RLS Policies
CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY notifications_delete ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================================
-- 5. subscriptions — User subscription and billing state
-- =====================================================================
-- Repository: src/features/billing/supabase-billing-repository.ts
-- Expected columns: id, user_id, plan_name, status, start_date, end_date,
--                   created_at, updated_at
-- Repository uses: .upsert(dbRow, { onConflict: 'user_id' })
--   → requires UNIQUE constraint on user_id
-- =====================================================================

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL DEFAULT 'FREE' CHECK (plan_name IN ('FREE', 'PRO', 'ENTERPRISE')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Register update trigger for subscriptions
CREATE TRIGGER trigger_update_subscriptions_timestamp
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- Indexes aligned with repository query patterns
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_name);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- subscriptions RLS Policies
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY subscriptions_insert ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY subscriptions_update ON public.subscriptions FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- =====================================================================
-- 6. audit_logs — Security and administrative audit trail
-- =====================================================================
-- Repository: src/core/monitoring/audit-logger.ts
-- Expected columns: id, user_id, action, entity_type, entity_id,
--                   old_value, new_value, created_at
-- =====================================================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes aligned with repository query patterns
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- audit_logs RLS Policies
-- Users can insert their own audit entries; only admins can read all
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY audit_logs_select_owner ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
-- Admin can read all audit logs (via is_org_admin check on their membership)
CREATE POLICY audit_logs_select_admin ON public.audit_logs FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
);
