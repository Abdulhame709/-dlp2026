# 08. Database Blueprint & Design Validation

**Author:** Principal Database Architect & Data Engineer  
**Status:** Approved & Validated  
**Version:** 1.1  
**Date:** July 27, 2026  

---

## 1. Entity Relationship Diagram (ERD) & Schema Topography

Below is our validated relational database layout. It maps individual personal accounts alongside hierarchical, multi-tenant workspace isolation.

```
       [ auth.users (Supabase Internal) ]
                      │
                      │ (1 : 1) [Enforced by PK/FK match]
                      ▼
                 [ profiles ]
                      │
                      ├──────────────────────────┐
                      │ (1 : M)                  │ (1 : M)
                      ▼                          ▼
         [ organization_members ]         [ team_members ]
                      │                          │
                      │ (M : 1)                  │ (M : 1)
                      ▼                          ▼
              [ organizations ] ◄──(1:M)──◄── [ teams ]
                      │
                      │ (1 : M)
                      ▼
                 [ projects ] ◄────── (1 : M) ───────┐
                      │                              │
                      │ (1 : M)                      │ (1 : M)
                      ▼                              ▼
                [ milestones ]                  [ tasks ] ◄──(M:1)──► [ goals ]
                                                     ▲
                                                     │ (1 : M)
                                                     ▼
                                              [ task_comments ]
                                              [ task_attachments ]
                                              [ task_dependencies ]
```

### Cardinalities & Foreign Keys List:
- **`profiles.id` (1 : 1) `auth.users.id`:** Matches Supabase auth ID. PK in `profiles` is also the FK pointing directly to `auth.users.id`.
- **`organizations` (1 : M) `organization_members`:** Matches which organizations a profile is authorized to access.
- **`organizations` (1 : M) `teams`:** Supports enterprise groups inside large companies.
- **`teams` (1 : M) `team_members`:** Associates profiles to specific functional teams (e.g., Marketing, Dev).
- **`organizations` (1 : M) `projects`:** Holds top-level projects assigned to an organization. Nullable for individual workspaces.
- **`projects` (1 : M) `tasks`:** Organizes tasks under target projects. Nullable for standalone tasks.
- **`goals` (1 : M) `tasks`:** Links executable daily actions back to high-level goals. Nullable.
- **`tasks` (1 : M) `task_comments` / `task_attachments` / `task_dependencies`:** Standard supportive sub-tables.

---

## 2. User System & Profile Table Specification
**Supabase Auth** is the immutable master source of user identity.
Upon a user registering, Supabase Auth populates `auth.users` natively. To associate custom profiles and preferences with this identity safely, we declare a `profiles` table:

### TABLE: `profiles`
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);
```
- `preferences` is a generic `JSONB` schema allowing the dynamic activation of client settings (e.g., dashboard card placement, theme, sound notifications, and AI personality metrics) without requiring continuous SQL migrations.

---

## 3. Automated Audit Fields & Triggers
To enforce absolute traceability, the following fields are declared in **all** primary tables (`profiles`, `organizations`, `projects`, `tasks`, `goals`):
- `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`
- `created_by`: `UUID` (Foreign Key pointing to `profiles.id`, set to `auth.uid()` on row insertion)
- `updated_by`: `UUID` (Foreign Key pointing to `profiles.id`, set to `auth.uid()` on updates)

### Automated Timestamp Trigger Function:
Instead of manual updating of the `updated_at` column in application code, PostgreSQL triggers are registered to handle this natively:

```sql
-- Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example registration on profiles table
CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();
```

---

## 4. Soft Delete Strategy
To prevent accidental data loss and maintain relational references for analytics, sensitive entities (`tasks`, `projects`, `goals`, `documents`) will implement **Soft Delete**:
- **Field:** `deleted_at` - `TIMESTAMP WITH TIME ZONE` (Nullable).

### Implementation Rules:
1. **Filtering:** Every standard application-level read operation must append `AND deleted_at IS NULL`.
2. **Cascading Soft-Deletes:** When a `project` is soft-deleted, we execute a transaction that soft-deletes its child `tasks` and `milestones` simultaneously:
   ```sql
   UPDATE projects SET deleted_at = NOW() WHERE id = :project_id;
   UPDATE tasks SET deleted_at = NOW() WHERE project_id = :project_id;
   ```
3. **Hard Delete Policy:** To comply with GDPR privacy laws ("Right to be Forgotten"), an administrative command bypasses soft-delete and executes a physical hard cascade delete (`DELETE FROM profiles WHERE id = :user_id`) which propagates down all tables.

---

## 5. Database Performance Strategy (Indexes & Patterns)
We identify the three highest-frequency tables and configure their query paths:

### 5.1 TABLE: `tasks` (Read/Write-Heavy)
- *Common Query Patterns:*
  - Fetch user's active inbox: `SELECT * FROM tasks WHERE user_id = auth.uid() AND status = 'INBOX' AND deleted_at IS NULL ORDER BY priority DESC;`
  - Fetch project timeline: `SELECT * FROM tasks WHERE project_id = :id AND deleted_at IS NULL ORDER BY due_date ASC;`
- *Configured Indexes:*
  ```sql
  CREATE INDEX idx_tasks_user_status_deleted ON public.tasks(user_id, status) WHERE deleted_at IS NULL;
  CREATE INDEX idx_tasks_project_due_deleted ON public.tasks(project_id, due_date) WHERE deleted_at IS NULL;
  ```

### 5.2 TABLE: `activity_logs` (Write-Heavy Telemetry)
- *Common Query Patterns:*
  - Ingestion (highly dynamic inserts).
  - Weekly analytics computation: `SELECT event_name, count(*) FROM activity_logs WHERE user_id = :id AND created_at > NOW() - INTERVAL '7 days' GROUP BY event_name;`
- *Configured Indexes:*
  ```sql
  CREATE INDEX idx_activity_logs_user_created ON public.activity_logs(user_id, created_at DESC);
  ```

### 5.3 TABLE: `ai_conversations` & `ai_messages` (Read/Write-Heavy)
- *Common Query Patterns:*
  - Fetch history: `SELECT * FROM ai_messages WHERE conversation_id = :id ORDER BY created_at ASC;`
- *Configured Indexes:*
  ```sql
  CREATE INDEX idx_ai_messages_conversation_created ON public.ai_messages(conversation_id, created_at ASC);
  ```

---

## 6. Supabase Row Level Security (RLS) Policy Blueprint
The following policies enforce security at the absolute database layer. No user can view or alter rows unless authorized by PostgreSQL.

| Table | Policy Operation | Allowed Roles | SQL Condition (`USING` / `WITH CHECK`) |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `SELECT` | All Authenticated | `id = auth.uid()` |
| | `UPDATE` | All Authenticated | `id = auth.uid()` |
| **`organizations`** | `SELECT` | Org Members | `id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())` |
| | `INSERT` | Authenticated | `owner_id = auth.uid()` |
| | `UPDATE` | Org Admins / Owners | `owner_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = id AND user_id = auth.uid() AND role = 'ADMIN')` |
| **`tasks`** | `SELECT` | Owner / Org Members | `(user_id = auth.uid() AND organization_id IS NULL) OR (organization_id IS NOT NULL AND EXISTS (SELECT 1 FROM organization_members WHERE organization_id = tasks.organization_id AND user_id = auth.uid()))` |
| | `INSERT` | Owner / Org Members | `(user_id = auth.uid() AND organization_id IS NULL) OR (organization_id IS NOT NULL AND EXISTS (SELECT 1 FROM organization_members WHERE organization_id = organization_id AND user_id = auth.uid()))` |
| | `UPDATE` | Owner / Org Members | `user_id = auth.uid()` |
| | `DELETE` | Owner / Org Admins | `user_id = auth.uid()` |

### Policy SQL Example:
```sql
CREATE POLICY select_task_policy ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) 
        OR 
        (organization_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = tasks.organization_id 
            AND organization_members.user_id = auth.uid()
        ))
    );
```

---

## 7. Seed Data Pipeline (بيانات التطوير والولوج التجريبي)
A robust, local-only seed file (`prisma/seed.ts`) will populate the development database with mock data.
- **Demo Entities Created:**
  - `Demo User`: `demo@cortexai.local` (Password: `DemoSecret123!`).
  - `Demo Organization`: "Cortex Founders Inc."
  - `Sample Projects`: "Cortex Platform Launch"
  - `Sample Tasks` & `Sample Goals` mapped across different statuses.

### Safety Check:
To guarantee that demo seeds are never executed in production environments:
```typescript
// Inside prisma/seed.ts
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase.co')) {
  console.error("🛑 CRITICAL ERROR: Seed execution is blocked on Production Database!");
  process.exit(1);
}
```

---

## 8. Database Migration Lifecycle (خط النشر والترحيل الفني)
Database schemas must transition safely and deterministically across all environment stages:

```
[ Local Dev DB ] ➔ [ Git commit SQL Migrations ] ➔ [ Staging Supabase DB ] ➔ [ Production Supabase DB ]
```

1. **Local Development (Prisma CLI):**
   - Developer modifies `prisma/schema.prisma`.
   - Runs `npx prisma migrate dev --name <migration_name>` to automatically generate SQL migration scripts inside `prisma/migrations/`.
2. **Staging Environment (Automated CI):**
   - GitHub Actions workflow runs upon pushing to `develop` branch.
   - Deploys database changes via `npx prisma migrate deploy` to the staging Supabase DB.
   - Runs integration and automated unit tests.
3. **Production Release (Zero Manual Access):**
   - Once code is merged to `main`, GitHub Actions workflow applies SQL migrations using `npx prisma migrate deploy` targeting the production Supabase database connection pool.
   - No human developer has write permission to the production Postgres database direct console, preventing data corruption and tracking changes transparently.

---

## 9. SRE Production Backup & Recovery Metrics

To guarantee absolute availability and database protection, Cortex AI commits to the following SRE backup topology:

### 9.1 Backup Strategy Configuration
- **Continuous WAL Archiving:** Write-Ahead Logs (WAL) are streamed continuously to redundant cloud object storage (Amazon S3 / Supabase Backups Tiers) supporting physical point-in-time database restoration.
- **Daily Physical Backups:** Full compressed transactional database snapshots are executed automatically every 24 hours at `02:00 UTC` (lowest traffic period) and stored with standard AES-256 physical encryption.
- **Retention Policy:** Monthly snapshots are retained for 365 days; daily snapshots are retained for 30 days to optimize cost and compliance.

### 9.2 Key Recoverability Metrics
- **RPO (Recovery Point Objective):** **1 Hour**  
  *Justification:* With WAL continuous streaming, if an absolute regional server failure occurs, the database can be restored to any exact transaction point up to a maximum of 60 minutes before the disaster.
- **RTO (Recovery Time Objective):** **15 Minutes**  
  *Justification:* Through automated failover connection string switching and pre-configured cold standby Supabase PostgreSQL failover zones, the complete platform returns to fully-operational status within a maximum of 15 minutes.
