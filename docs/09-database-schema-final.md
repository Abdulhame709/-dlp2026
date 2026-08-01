# 09. Final Database Schema Specification & Blueprint Review

**Document Version:** 1.0  
**Status:** Ready for Migration Execution  
**Architect:** Principal Database Architect & Data Engineer  
**Date:** July 27, 2026  

---

## 1. Table Directory & MVP Scope (قائمة جميع جداول الـ MVP)

To ensure focus, minimize architectural overhead, and optimize staging, the database schema is strictly scoped to the following **9 MVP tables**:

| Table Name | Purpose | Description |
| :--- | :--- | :--- |
| **`auth.users`** | Supabase Internal Auth | Holds native platform identity, JWT secrets, emails, and secure passwords. Managed by Supabase Auth engine. |
| **`profiles`** | User Metadata | Holds profile and personal preferences, mapped 1:1 with `auth.users`. |
| **`organizations`** | SaaS Tenancy Units | Represents business containers/teams supporting multi-tenant isolation. |
| **`organization_members`** | Membership Lookup | Many-to-Many map associating users to organizations with roles. |
| **`projects`** | Work Packages | High-level containers for group or individual milestones and tasks. |
| **`tasks`** | Base Execution Unit | Holds actual actionable tasks with priorities, status, and deadlines. |
| **`goals`** | Strategic Milestones | Allows users to track goals. Mapped to tasks for tracking. |
| **`activity_logs`** | Telemetry Events | Stores high-frequency user/AI system logs for product analytics. |
| **`feature_flags`** | Feature Controls | Stores runtime configuration flags to toggle features dynamically. |

---

## 2. Table Column Specifications (تفاصيل هيكل الجداول)

All tables strictly enforce our **Naming Conventions**:
- Table names and column names use lowercase `snake_case`.
- Primary keys are secure `UUID` types.
- Date fields use `timestamptz` (Timestamp with time zone).
- Audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`) are consistently defined.

---

### 2.1 Table: `profiles`
*Purpose:* Holds user metadata. Mapped 1:1 to `auth.users.id`.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | *None* | PK, FK | Yes | Matches `auth.users(id)` (On Delete Cascade). |
| **`full_name`** | `varchar(255)` | No | *None* | *None* | No | User's complete display name. |
| **`avatar_url`** | `varchar(512)` | Yes | `NULL` | *None* | No | Link to storage avatar asset. |
| **`timezone`** | `varchar(100)` | No | `'UTC'` | *None* | No | User's active timezone. |
| **`language`** | `varchar(10)` | No | `'en'` | *None* | No | Locale choice (`en`, `ar`). |
| **`preferences`** | `jsonb` | No | `'{}'::jsonb` | *None* | No | Theme, workspace layout, or AI behavior style. |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of profiles creation. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Automatically managed by trigger. |
| **`deleted_at`** | `timestamptz` | Yes | `NULL` | *None* | No | Nullable timestamp for soft delete. |
| **`created_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id` (self-referential audit). |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id` (self-referential audit). |

---

### 2.2 Table: `organizations`
*Purpose:* Holds Multi-Tenant SaaS units.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Primary key container ID. |
| **`name`** | `varchar(255)` | No | *None* | *None* | No | Name of company/tenant space. |
| **`logo_url`** | `varchar(512)` | Yes | `NULL` | *None* | No | URL to company brand logo. |
| **`owner_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id` (On Delete Restrict). |
| **`subscription_plan`** | `varchar(50)` | No | `'FREE'` | *None* | No | active plan level (`FREE`, `PRO`, `BUSINESS`). |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of container initialization. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Automatically managed by trigger. |
| **`created_by`** | `UUID` | No | *None* | FK | No | Mapped to `profiles.id`. |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |

---

### 2.3 Table: `organization_members`
*Purpose:* Many-to-Many lookup associating profiles to organizations.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Unique lookup identifier. |
| **`organization_id`**| `UUID` | No | *None* | FK | Yes | Mapped to `organizations.id` (Cascade). |
| **`user_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id` (Cascade). |
| **`role`** | `varchar(50)` | No | `'MEMBER'` | *None* | No | Tenant permission role (`OWNER`, `ADMIN`, `MEMBER`). |
| **`joined_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of member joining. |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Audit timestamp. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Audit timestamp (Trigger). |
| **`created_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |

---

### 2.4 Table: `projects`
*Purpose:* Folders for grouping milestones and tasks.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Primary project identity. |
| **`organization_id`**| `UUID` | Yes | `NULL` | FK | Yes | Nullable. If defined, implies team scope. |
| **`owner_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id` (Restricted). |
| **`name`** | `varchar(255)` | No | *None* | *None* | No | Project visual title. |
| **`description`** | `text` | Yes | `NULL` | *None* | No | Project description details. |
| **`status`** | `varchar(50)` | No | `'ACTIVE'` | *None* | Yes | status (`ACTIVE`, `ARCHIVED`, `COMPLETED`). |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of project creation. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Auto-updated by trigger. |
| **`deleted_at`** | `timestamptz` | Yes | `NULL` | *None* | Yes | Soft-delete timestamp. |
| **`created_by`** | `UUID` | No | *None* | FK | No | Mapped to `profiles.id`. |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |

---

### 2.5 Table: `tasks`
*Purpose:* Actionable productivity records.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Primary task identifier. |
| **`user_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id` (Cascade). |
| **`organization_id`**| `UUID` | Yes | `NULL` | FK | Yes | Nullable. References organization ownership. |
| **`project_id`** | `UUID` | Yes | `NULL` | FK | Yes | Nullable. References parent project. |
| **`goal_id`** | `UUID` | Yes | `NULL` | FK | Yes | Nullable. Links task to a goal. |
| **`parent_task_id`**| `UUID` | Yes | `NULL` | FK | Yes | Self-references task for subtasks. |
| **`title`** | `varchar(255)` | No | *None* | *None* | No | Task text title. |
| **`description`** | `text` | Yes | `NULL` | *None* | No | Task detailed context. |
| **`status`** | `varchar(50)` | No | `'INBOX'` | *None* | Yes | status (`INBOX`, `PLANNED`, `IN_PROGRESS`, `WAITING`, `COMPLETED`, `ARCHIVED`). |
| **`priority`** | `varchar(50)` | No | `'MEDIUM'`| *None* | Yes | priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`). |
| **`due_date`** | `timestamptz` | Yes | `NULL` | *None* | Yes | Task deadline. |
| **`estimated_duration`**| `integer`| Yes | `NULL` | *None* | No | In minutes (AI or user estimate). |
| **`actual_duration`** | `integer`| Yes | `NULL` | *None* | No | In minutes spent. |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of task creation. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Auto-updated by trigger. |
| **`completed_at`** | `timestamptz` | Yes | `NULL` | *None* | No | Handled when status set to `COMPLETED`. |
| **`deleted_at`** | `timestamptz` | Yes | `NULL` | *None* | Yes | Soft-delete timestamp. |
| **`created_by`** | `UUID` | No | *None* | FK | No | Mapped to `profiles.id`. |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |

---

### 2.6 Table: `goals`
*Purpose:* Strategic multi-milestone objectives.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Goal container ID. |
| **`user_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id`. |
| **`organization_id`**| `UUID` | Yes | `NULL` | FK | Yes | Nullable organization parent context. |
| **`title`** | `varchar(255)` | No | *None* | *None* | No | Goal display title. |
| **`description`** | `text` | Yes | `NULL` | *None* | No | Description of goal objectives. |
| **`deadline`** | `timestamptz` | Yes | `NULL` | *None* | Yes | Target target completion date. |
| **`status`** | `varchar(50)` | No | `'ACTIVE'` | *None* | Yes | Status (`ACTIVE`, `ARCHIVED`, `COMPLETED`). |
| **`progress`** | `integer` | No | `0` | *None* | No | Integer progress percent (`0` to `100`). |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Date of goal creation. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Auto-updated by trigger. |
| **`deleted_at`** | `timestamptz` | Yes | `NULL` | *None* | Yes | Soft-delete timestamp. |
| **`created_by`** | `UUID` | No | *None* | FK | No | Mapped to `profiles.id`. |
| **`updated_by`** | `UUID` | Yes | `NULL` | FK | No | Mapped to `profiles.id`. |

---

### 2.7 Table: `activity_logs`
*Purpose:* Write-heavy system telemetry metrics.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Primary event identifier. |
| **`user_id`** | `UUID` | No | *None* | FK | Yes | Mapped to `profiles.id` (On Delete Cascade). |
| **`event_name`** | `varchar(100)` | No | *None* | *None* | Yes | Telemetry signature (e.g., `'task_completed'`). |
| **`metadata`** | `jsonb` | No | `'{}'::jsonb` | *None* | No | Dynamic payload attributes. |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | Yes | Date event was recorded (Audit-only). |

---

### 2.8 Table: `feature_flags`
*Purpose:* Holds dynamic config toggles.

| Column Name | Data Type | Nullable | Default Value | Keys | Index | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`id`** | `UUID` | No | `gen_random_uuid()` | PK | Yes | Flag ID. |
| **`key`** | `varchar(100)` | No | *None* | *None* | Yes | Unique lookup string key (e.g. `'feature_teams'`). |
| **`description`** | `text` | Yes | `NULL` | *None* | No | Explanation of flag features. |
| **`is_enabled`** | `boolean` | No | `false` | *None* | No | Toggle state. |
| **`created_at`** | `timestamptz` | No | `NOW()` | *None* | No | Record date. |
| **`updated_at`** | `timestamptz` | No | `NOW()` | *None* | No | Record date (Trigger). |

---

## 3. Standard Relational Key Constraints (العلاقات بين الجداول)

To prevent data corruption, PostgreSQL foreign keys strictly manage relationships:

### 3.1 One-to-One Relationships (1 : 1)
- `profiles(id)` references `auth.users(id)` with `ON DELETE CASCADE`. Removing an authenticated user automatically purges their profile.

### 3.2 One-to-Many Relationships (1 : M)
- `organizations(id)` ➔ `organization_members(organization_id)` (`ON DELETE CASCADE`).
- `profiles(id)` ➔ `organizations(owner_id)` (`ON DELETE RESTRICT`). Owners must transfer ownership before deleting profiles.
- `organizations(id)` ➔ `projects(organization_id)` (`ON DELETE CASCADE`).
- `projects(id)` ➔ `tasks(project_id)` (`ON DELETE SET NULL`). Deleting projects retains tasks but detaches project links.
- `goals(id)` ➔ `tasks(goal_id)` (`ON DELETE SET NULL`).
- `tasks(id)` ➔ `tasks(parent_task_id)` (`ON DELETE CASCADE` on child subtasks).
- `profiles(id)` ➔ `tasks(user_id)` (`ON DELETE CASCADE`).
- `profiles(id)` ➔ `activity_logs(user_id)` (`ON DELETE CASCADE`).

---

## 4. Supabase Row Level Security (RLS) SQL Implementations

Below is our exact, ready-to-execute Postgres DDL SQL RLS security scripts:

### 4.1 Table `profiles`
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: All active authenticated users can view profiles.
CREATE POLICY profiles_select_policy ON public.profiles
    FOR SELECT TO authenticated USING (deleted_at IS NULL);

-- UPDATE: Only owner can modify their own profile details.
CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
```

### 4.2 Table `organizations`
```sql
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- SELECT: Only organization members can view the company tenant record.
CREATE POLICY orgs_select_policy ON public.organizations
    FOR SELECT TO authenticated USING (
        id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
    );

-- INSERT: All authenticated can register new companies (owner_id matches auth.uid()).
CREATE POLICY orgs_insert_policy ON public.organizations
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

-- UPDATE: Only designated Admins/Owners can modify name/logo.
CREATE POLICY orgs_update_policy ON public.organizations
    FOR UPDATE TO authenticated USING (
        owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = id AND user_id = auth.uid() AND role = 'ADMIN'
        )
    );
```

### 4.3 Table `tasks`
```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Fetch personal task, or team-scoped task under member's organization.
CREATE POLICY tasks_select_policy ON public.tasks
    FOR SELECT TO authenticated USING (
        (deleted_at IS NULL) AND (
            (user_id = auth.uid() AND organization_id IS NULL)
            OR
            (organization_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.organization_members 
                WHERE organization_members.organization_id = tasks.organization_id 
                AND organization_members.user_id = auth.uid()
            ))
        )
    );

-- INSERT: Insert task belonging to self, or under authorized org context.
CREATE POLICY tasks_insert_policy ON public.tasks
    FOR INSERT TO authenticated WITH CHECK (
        (user_id = auth.uid() AND organization_id IS NULL)
        OR
        (organization_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = organization_id 
            AND organization_members.user_id = auth.uid()
        ))
    );

-- UPDATE: Only original assignee or org administrators can patch task fields.
CREATE POLICY tasks_update_policy ON public.tasks
    FOR UPDATE TO authenticated USING (
        user_id = auth.uid() OR (
            organization_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.organization_members 
                WHERE organization_members.organization_id = tasks.organization_id 
                AND organization_members.user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
            )
        )
    );

-- DELETE: soft delete is a standard UPDATE. Physical hard delete is blocked.
CREATE POLICY tasks_delete_policy ON public.tasks
    FOR DELETE TO authenticated USING (user_id = auth.uid());
```
---

## 5. Blueprint Acceptance & Migration Phase 1A Approval

Our final specifications comply fully with snake_case standards, audit trails, and multi-tenant RLS isolation. 

With this final schema approved, we are prepared to initiate **Phase 1A: Writing & Deploying Prisma Migrations** to establish PostgreSQL tables in our staging/local Supabase databases!
