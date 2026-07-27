# 17. Data Flow & Telemetry Ingestion Blueprints

**Author:** Senior Data Engineer & Telemetry Lead  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Task Creation Lifecycle Flow

Creating a task triggers a coordinated flow across multiple decoupled layers of the platform:

```
[ UI Component: Form Submit ] ➔ (1. Optimistic Insertion) ➔ [ Render Task Instantly ]
             │
             ▼ (2. Dispatches task creation payload)
     [ TaskService Layer ]
             │
             ▼ (3. Invokes Repository contract)
 [ SupabaseTaskRepository ]
             │
             ▼ (4. Executes SQL insert with user JWT)
   [ Supabase PostgreSQL ] ─── (5. Verifies RLS Policies) ───► [ Record Saved ]
             │                                                        │
             ▼ (6. Database returns row)                              ▼ (7. Broadcaster)
     [ UI State Synced ] ◄──────────────────────────────────── [ EventBus Publish ]
                                                                      │
                                                     ┌────────────────┴────────────────┐
                                                     ▼ (Listener)                      ▼ (Listener)
                                             [ Telemetry Logs ]                [ AI Planner Queue ]
```

---

## 2. Telemetry Ingestion Engine

All business-critical operations emit structured telemetry events to our audit log streams:

- **`task_created`:** Triggered when a new task is initialized. Stores priority, categories, and creation source (Manual vs. AI).
- **`task_completed`:** Triggered when status transitions to `COMPLETED`. Stores total actual duration spent vs. estimated duration.
- **`attachment_uploaded`:** Triggered when an attachment is uploaded to Supabase Storage. Stores file type and size.
- **`sync_started` / `sync_completed`:** Triggered when the browser regains internet connection and flushes the offline operations queue.

---

## 3. Database Consistency Triggers
To guarantee structural consistency, updates to records trigger automatic PostgreSQL procedures:
- **`trigger_update_timestamp`:** Fires before any row is updated, executing our plpgsql function `set_updated_at_column()` to keep timestamps accurate.
- **`trigger_sync_profiles`:** Fires on Supabase user registration to populate the `profiles` table automatically from `auth.users`.
