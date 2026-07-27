# 03. Database Schema & Data Model Design

## 1. Entity Relationship Diagram (ERD)

Our final, production-grade schema topographical relationships are defined as follows:

```
  [profiles] ◄──(1:1)──► [auth.users]
     │
     ├── (1:M) ──► [organization_members] ──(M:1)──► [organizations]
     │                                                     │
     │                                                     ├─ (1:M) ──► [projects]
     │                                                     │               │
     │                                                     │               ▼
     │                                                     │             [tasks]
     │                                                     │               ▲
     │                                                     └─ (1:M) ───────┤
     │                                                                     │
     └───────────────────────── (1:M) ─────────────────────────────────────┘
```

---

## 2. Table Specifications & Primary Schemas

All table schemas use lower `snake_case` with secure `UUID` primary keys, standard `timestamptz` date fields, and explicit cascading foreign keys.

### 2.1 Table: `profiles`
*Purpose:* Maps 1:1 to Supabase's `auth.users(id)`.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
```

### 2.2 Table: `organizations`
*Purpose:* Tenancy groups (supporting individual or multi-member team/enterprise setups).

```sql
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
```

### 2.3 Table: `organization_members`
*Purpose:* Many-to-Many association of users and organizations.

```sql
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
```

### 2.4 Table: `projects`
*Purpose:* Parent containers for milestones and tasks.

```sql
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
```

### 2.5 Table: `tasks`
*Purpose:* Actionable execution logs. Supports Soft-Delete.

```sql
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
```

### 2.6 Table: `goals`
*Purpose:* Strategic progress-tracked objectives.

```sql
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
```

### 2.7 Table: `activity_logs`
*Purpose:* Product telemetry tracking metrics.

```sql
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.8 Table: `feature_flags`
*Purpose:* Dynamic feature toggling.

```sql
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Indexing Strategy & Performance Configuration
To support high-frequency reads, the following indices are deployed:
- `idx_tasks_user_status_deleted` on `tasks(user_id, status)` where `deleted_at IS NULL` (inbox fetches).
- `idx_activity_logs_user_event` on `activity_logs(user_id, event_name, created_at DESC)` (analytics computations).
- `idx_org_members_user` on `organization_members(user_id)` (tenant permission checks).

---

## 4. Row Level Security (RLS) Policy Specifications
Postgres RLS is enabled on all tables.
- **Profiles Policy:** Users can read profiles (`deleted_at IS NULL`), but can only update their own profile (`id = auth.uid()`).
- **Organizations Policy:** Users can only query organizations where their user ID has an active membership inside `organization_members`.
- **Tasks Policy:** Evaluates the user's ID for personal tasks, and checks the user's organizational membership for team-scoped tasks.

---

## 5. Migration History (سجل عمليات الترحيل السحابة)

### Migration 1: `20260727204500_init_cortex_db`
- **Date:** July 27, 2026
- **Status:** APPROVED & DEPLOYED
- **Type:** DDL Initialization
- **Description:** Deployed extensions (`uuid-ossp`, `pgcrypto`), timestamp trigger routines, created the 8 application tables with cascade constraints, configured custom indices, enabled RLS policies, and established development seeding patterns.
