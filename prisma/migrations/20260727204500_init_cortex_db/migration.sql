-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create SECURITY DEFINER helper functions to permanently eliminate RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE organization_id = org_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is OWNER of the organization
    IF EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id AND owner_id = auth.uid()) THEN
        RETURN TRUE;
    END IF;
    -- Check if user is OWNER or ADMIN in organization_members
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE organization_id = org_id AND user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 1. Create Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Register update trigger for profiles
CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 2. Create Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Register update trigger for organizations
CREATE TRIGGER trigger_update_organizations_timestamp
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 3. Create Organization Members Table (Many-to-Many map)
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

-- Register update trigger for organization_members
CREATE TRIGGER trigger_update_org_members_timestamp
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 4. Create Projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Register update trigger for projects
CREATE TRIGGER trigger_update_projects_timestamp
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 5. Create Goals Table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Register update trigger for goals
CREATE TRIGGER trigger_update_goals_timestamp
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 6. Create Tasks Table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'INBOX',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMPTZ,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Register update trigger for tasks
CREATE TRIGGER trigger_update_tasks_timestamp
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- 7. Create Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Feature Flags Table
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Register update trigger for feature_flags
CREATE TRIGGER trigger_update_feature_flags_timestamp
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

-- Add self-references to profiles table now that it exists
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_updated_by FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create Indexes for performance optimization
CREATE INDEX idx_profiles_deleted ON public.profiles(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_projects_org ON public.projects(organization_id);
CREATE INDEX idx_projects_status_deleted ON public.projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_user_status_deleted ON public.goals(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_user_status_deleted ON public.tasks(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_due ON public.tasks(due_date);
CREATE INDEX idx_activity_logs_user_event ON public.activity_logs(user_id, event_name, created_at DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- profiles RLS Policies
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY profiles_insert_owner ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_owner ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- organizations RLS Policies
CREATE POLICY orgs_select_member ON public.organizations FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.is_org_member(id));
CREATE POLICY orgs_insert_owner ON public.organizations FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY orgs_update_admin ON public.organizations FOR UPDATE TO authenticated USING (public.is_org_admin(id));

-- organization_members RLS Policies
CREATE POLICY org_members_select ON public.organization_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_org_member(organization_id));
CREATE POLICY org_members_insert_admin ON public.organization_members FOR INSERT TO authenticated WITH CHECK (public.is_org_admin(organization_id));
CREATE POLICY org_members_update_admin ON public.organization_members FOR UPDATE TO authenticated USING (public.is_org_admin(organization_id));
CREATE POLICY org_members_delete_admin ON public.organization_members FOR DELETE TO authenticated USING (public.is_org_admin(organization_id));

-- projects RLS Policies
CREATE POLICY projects_select_all ON public.projects FOR SELECT TO authenticated USING (
    (deleted_at IS NULL) AND (
        (owner_id = auth.uid() AND organization_id IS NULL)
        OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
);
CREATE POLICY projects_insert ON public.projects FOR INSERT TO authenticated WITH CHECK (
    (owner_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);
CREATE POLICY projects_update ON public.projects FOR UPDATE TO authenticated USING (
    (owner_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);

-- goals RLS Policies
CREATE POLICY goals_select ON public.goals FOR SELECT TO authenticated USING (
    (deleted_at IS NULL) AND (
        (user_id = auth.uid() AND organization_id IS NULL)
        OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
);
CREATE POLICY goals_insert ON public.goals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY goals_update ON public.goals FOR UPDATE TO authenticated USING (
    (user_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);

-- tasks RLS Policies
CREATE POLICY tasks_select ON public.tasks FOR SELECT TO authenticated USING (
    (deleted_at IS NULL) AND (
        (user_id = auth.uid() AND organization_id IS NULL)
        OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
);
CREATE POLICY tasks_insert ON public.tasks FOR INSERT TO authenticated WITH CHECK (
    (user_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);
CREATE POLICY tasks_update ON public.tasks FOR UPDATE TO authenticated USING (
    (user_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);
CREATE POLICY tasks_delete ON public.tasks FOR DELETE TO authenticated USING (
    (user_id = auth.uid() AND organization_id IS NULL)
    OR
    (organization_id IS NOT NULL AND public.is_org_member(organization_id))
);

-- activity_logs RLS Policies
CREATE POLICY activity_logs_select ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY activity_logs_insert ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- feature_flags RLS Policies
CREATE POLICY feature_flags_select ON public.feature_flags FOR SELECT TO authenticated USING (TRUE);
