# 18. Realtime Database Synchronization Specs

**Author:** Realtime Systems SRE & WebSocket Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Supabase Realtime WebSocket Topology

Cortex AI leverages **Supabase Realtime** channels to keep multiple browser sessions, team workspaces, and dashboard widgets synchronized in real time without manual polling:

```
[ User Browser Tab A ]                      [ User Browser Tab B ]
          │                                           │
          │ (Listens on WS Channel)                   │ (Listens on WS Channel)
          ▼                                           ▼
┌───────────────────────────────────────────────────────────────┐
│                    SUPABASE REALTIME ENGINE                   │
│                     (PostgreSQL Replication)                  │
└───────────────────────────────▲───────────────────────────────┘
                                │ (Fires WAL replication event)
                                │
                      [ PostgreSQL Database ]
                        (Table 'tasks' UPDATE)
```

- **Replication WAL Engine:** Supabase reads PostgreSQL Write-Ahead Logs (WAL) and translates mutations into secure WebSocket push events broadcasted to authorized channel subscribers.
- **RLS Integration:** The Realtime engine automatically honors PostgreSQL **Row Level Security (RLS)**. It evaluates the user's JWT channel claims and filters incoming database changes so that no user receives notifications or updates belonging to another user or tenant.

---

## 2. Active Sync Channels Configuration

We selectively enable real-time replication for high-value collaborative tables to avoid browser CPU overhead:

1. **`tasks` Channel:**
   - **Events Captured:** `INSERT`, `UPDATE`, `DELETE`.
   - **Client Handler:** Updates the local Zustand task store dynamically, instantly refreshing List, Kanban, and Calendar layouts.
2. **`activity_logs` Channel:**
   - **Events Captured:** `INSERT`.
   - **Client Handler:** Updates the SRE and activity timeline widgets.

---

## 3. Client Subscription Implementation

To integrate real-time listeners inside our React App Router pages, the following hook template is deployed:

```typescript
import { useEffect } from 'react';
import { createClient } from '@/core/database/client';

export function useRealtimeTasks(userId: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to task changes where user_id matches
    const channel = supabase
      .channel(`realtime-tasks-user-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('🔌 Realtime Database Update Received:', payload);
          onUpdate(); // Triggers UI list refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
}
```
This guarantees that if a user opens Cortex AI on their laptop and mobile browser simultaneously, completing a task on one instantly reflects on the other with zero latency!
