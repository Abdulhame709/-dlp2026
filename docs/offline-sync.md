# 19. Offline Synchronization & Conflict Resolution Specification

**Author:** SRE Lead & Core Developer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Offline Operation Queue Flow

When internet connectivity is dropped or degraded, Cortex AI guarantees continuous operation using our client-side **Sync Manager** (`src/core/utils/sync-manager.ts`):

```
       [ Client executes CRUD mutation ]
                       │
             [ Is Browser Online? ]
                       │
          ┌────────────┴────────────┐
          ▼ (Yes)                   ▼ (No)
[ Save to PostgreSQL ]     [ Queue Mutation in LocalStorage ]
                            [ Render Optimistic UI State ]
                                    │
                         [ Browser Fires 'online' Event ]
                                    │
                         [ Flush Operations Queue ]
                                    │
                         [ Re-evaluate Constraints ]
```

---

## 2. Queue Structure Specification

Pending operations are compiled into strict structural schemas in `localStorage` under the key `cortex_pending_sync_queue`:

```typescript
interface PendingOperation {
  id: string; // Unique Sync Operation ID
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE';
  entityType: 'TASK' | 'PROJECT' | 'GOAL';
  payload: any; // Mapped database columns payload
  timestamp: number; // Unix milliseconds
}
```

---

## 3. Conflict Resolution Strategy: Last-Write-Wins (LWW)

When synchronizing cached offline modifications back to our PostgreSQL cloud database, conflicts (e.g., another member updated the same task while the user was offline) are resolved using a **Last-Write-Wins (LWW) Strategy**:

1. **Timestamp Auditing:** Every task record has an `updated_at` timestamp.
2. **Evaluation:** When the Sync Manager pushes an update, the backend checks:
   - If `payload.timestamp > database.updated_at`, the offline operation overrides the database.
   - If `payload.timestamp < database.updated_at`, the database record takes precedence. The offline operation is discarded, and the client's local state is rolled back to match the database values.
3. **Retry Strategy:** Failed network connections during a sync flush are caught and re-queued. The Sync Manager implements an exponential backoff retry scheduler (`10s`, `30s`, `60s`, `300s`) to prevent API rate-limit exhaustion.
