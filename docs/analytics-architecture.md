# 14. Analytics Pipeline & Time-Aggregation Architecture

**Author:** Chief Data Officer & SRE Lead  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Event Ingestion Pipeline Topology

Cortex AI implements a non-blocking, asynchronous **Event Ingestion Pipeline** powered by our central, decoupled `EventBus`:

```
[ Domain Services: Task/Goal/Proj ] ➔ (1. Broadcast Event) ➔ [ central EventBus ]
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             ▼ (2. Listens and pipes events)                 ▼ (3. Other listeners)
                                    [ AnalyticsService ]                             [ AI Planning Engine ]
                                             │
                                             ▼ (4. Records raw event)
                                [ PostgreSQL / Supabase ]
                                             │
                                             ▼ (5. Triggers daily analytics)
                                   [ Metrics Aggregator ]
```

- **Asynchronous Decoupling:** Domain services never write directly to analytics tables. They publish standard events (like `TaskCreated`, `TaskCompleted`), allowing the `AnalyticsService` to capture them asynchronously, ensuring low latency for users.

---

## 2. Supported Telemetry Events & Schemas

The following events are monitored, sanitized, and stored in our database `activity_logs` table:
- **`TaskCreated`:** Holds task categories, priorities, and creation channels.
- **`TaskUpdated` / `TaskCompleted`:** Tracks task actual duration, priority shifts, and status rotations.
- **`TaskDeleted`:** Tracks soft-delete trends.
- **`GoalUpdated` / `ProjectCreated`:** Tracks high-level strategic workspace mutations.

---

## 3. Time Aggregation Engine
To power our productivity dashboard widgets and weekly reports, we support multi-range aggregations:
- **Supported Ranges:** `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`.
- **Dynamic Computed Metrics:**
  - **Completion Rate:** Completed tasks compared to total created tasks in that period.
  - **Growth Rate:** Relative progress compared to the previous time range.
  - **Focus Time:** Sum of actual task completion durations.
  - **Average Delay Time:** Average days tasks exceeded their `due_date` before completion.
