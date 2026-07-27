# 03. Database Schema & Data Model Design

## 1. Core Entity Relationship Model
The physical PostgreSQL schema is designed for scalability and enforces clean relational integrity. 

```
  [users] ── (1:1) ── [profiles]
     │
     └── (1:M) ── [organization_members] ── (M:1) ── [organizations]
                       │                                   │
                       │ (Member can view)                 │
                       ▼                                   ▼
                [projects] ◄──────── (1:M) ───────── [projects]
                       │
                       ▼
                 [milestones] ◄────── (1:M) ─────── [tasks]
```

---

## 2. Table Schemas & Key Fields

### 2.1 Identity & User Tables

#### TABLE: `users`
*Purpose:* Holds system-level authentication identity.
- `id`: `UUID` (Primary Key)
- `email`: `VARCHAR` (Unique, Indexed)
- `password_hash`: `VARCHAR`
- `email_verified`: `BOOLEAN` (Default: `false`)
- `status`: `ENUM` (`ACTIVE`, `INACTIVE`, `SUSPENDED`)
- `created_at`: `TIMESTAMP` (Default: `NOW()`)
- `updated_at`: `TIMESTAMP`

#### TABLE: `profiles`
*Purpose:* User metadata and customization.
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key -> `users.id`, Cascades)
- `full_name`: `VARCHAR`
- `avatar_url`: `VARCHAR` (Nullable)
- `phone`: `VARCHAR` (Nullable)
- `timezone`: `VARCHAR` (Default: `'UTC'`)
- `language`: `VARCHAR` (Default: `'en'`)
- `theme_preference`: `VARCHAR` (Default: `'light'`)
- `created_at`: `TIMESTAMP`

#### TABLE: `user_preferences`
*Purpose:* Granular settings for AI and notification styles.
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key -> `users.id`)
- `working_hours_start`: `VARCHAR` (Default: `'09:00'`)
- `working_hours_end`: `VARCHAR` (Default: `'17:00'`)
- `planning_style`: `VARCHAR` (Default: `'balanced'`)
- `notification_email`: `BOOLEAN` (Default: `true`)
- `notification_push`: `BOOLEAN` (Default: `true`)
- `ai_behavior_style`: `VARCHAR` (Default: `'supportive'`)

---

### 2.2 Organizations & Team Tables (Multi-Tenancy)

#### TABLE: `organizations`
*Purpose:* Customer container for teams/enterprises.
- `id`: `UUID` (Primary Key)
- `name`: `VARCHAR`
- `logo_url`: `VARCHAR` (Nullable)
- `owner_id`: `UUID` (Foreign Key -> `users.id`)
- `subscription_plan`: `VARCHAR` (Default: `'FREE'`)
- `created_at`: `TIMESTAMP`

#### TABLE: `organization_members`
*Purpose:* Many-to-many lookup for organizational tenancy.
- `id`: `UUID` (Primary Key)
- `organization_id`: `UUID` (Foreign Key -> `organizations.id`, Indexed)
- `user_id`: `UUID` (Foreign Key -> `users.id`, Indexed)
- `role`: `ENUM` (`OWNER`, `ADMIN`, `MEMBER`) (Default: `'MEMBER'`)
- `joined_at`: `TIMESTAMP`

---

### 2.3 Task & Project Management Tables

#### TABLE: `projects`
*Purpose:* Containers for large work objectives.
- `id`: `UUID` (Primary Key)
- `organization_id`: `UUID` (Foreign Key -> `organizations.id`, Nullable for individual accounts)
- `owner_id`: `UUID` (Foreign Key -> `users.id`)
- `name`: `VARCHAR`
- `description`: `TEXT` (Nullable)
- `status`: `ENUM` (`ACTIVE`, `ARCHIVED`, `COMPLETED`)
- `created_at`: `TIMESTAMP`
- `updated_at`: `TIMESTAMP`

#### TABLE: `tasks`
*Purpose:* Primary productivity execution entity.
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key -> `users.id`, Indexed)
- `organization_id`: `UUID` (Foreign Key -> `organizations.id`, Nullable, Indexed)
- `project_id`: `UUID` (Foreign Key -> `projects.id`, Nullable, Indexed)
- `goal_id`: `UUID` (Nullable)
- `parent_task_id`: `UUID` (Self-referential Key, Nullable)
- `title`: `VARCHAR`
- `description`: `TEXT` (Nullable)
- `status`: `ENUM` (`INBOX`, `PLANNED`, `IN_PROGRESS`, `WAITING`, `COMPLETED`, `ARCHIVED`)
- `priority`: `ENUM` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
- `due_date`: `TIMESTAMP` (Nullable)
- `estimated_duration`: `INTEGER` (In minutes, Nullable)
- `actual_duration`: `INTEGER` (In minutes, Nullable)
- `created_at`: `TIMESTAMP`
- `updated_at`: `TIMESTAMP`
- `completed_at`: `TIMESTAMP` (Nullable)

---

### 2.4 Intelligence & Telemetry Tables

#### TABLE: `ai_conversations`
*Purpose:* Conversation sessions with the Assistant.
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key -> `users.id`, Indexed)
- `title`: `VARCHAR`
- `created_at`: `TIMESTAMP`

#### TABLE: `ai_messages`
*Purpose:* Individual messages within a chat.
- `id`: `UUID` (Primary Key)
- `conversation_id`: `UUID` (Foreign Key -> `ai_conversations.id`, Indexed)
- `role`: `ENUM` (`SYSTEM`, `USER`, `ASSISTANT`)
- `content`: `TEXT`
- `token_usage`: `INTEGER` (Nullable)
- `created_at`: `TIMESTAMP`

#### TABLE: `activity_logs` (Event Tracking / Telemetry)
*Purpose:* Captures the Event Tracking Architecture.
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key -> `users.id`, Indexed)
- `event_name`: `VARCHAR` (Indexed, e.g., `'user_created_task'`)
- `metadata`: `JSONB` (Dynamic metadata payload)
- `created_at`: `TIMESTAMP` (Default: `NOW()`)

---

## 3. Indexing Strategy & Performance
To ensure sub-second response times on dashboard operations and telemetry joins, PostgreSQL primary indexes are configured on high-read columns:

```sql
-- Indexes for Task queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_org_id ON tasks(organization_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Indexes for Multi-Tenant verification
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- Indexes for Event Tracking Analytics
CREATE INDEX idx_activity_logs_user_event ON activity_logs(user_id, event_name);
```

---

## 4. Supabase Row Level Security (RLS) Rules
Row Level Security enforces data privacy directly inside the PostgreSQL engine. Here is our declarative RLS policy mapping:

```sql
-- Enforce RLS on Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Individual Task Access
CREATE POLICY task_individual_isolation_policy ON tasks
  FOR ALL
  USING (user_id = auth.uid() AND organization_id IS NULL);

-- Policy 2: Team Task Access
CREATE POLICY task_team_isolation_policy ON tasks
  FOR ALL
  USING (
    organization_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );
```
These security rules prevent data leakage across users and corporate organizations, even if backend middleware errors occur.
