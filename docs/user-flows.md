# 15. Product User Flows & Interaction Blueprints

**Author:** Chief Product Officer & Senior UX Researcher  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Complete User Journey Flow (Register to Dashboard)

Below is the verified, edge-enforced user onboarding and session registration journey:

```
[ Step 1: Register ] ➔ [ Step 2: Verification ] ➔ [ Step 3: Login ]
                                                        │
                                                        ▼ (Edge Middleware Gate)
                                              [ Is Onboarding Completed? ]
                                                        │
                                        ┌───────────────┴───────────────┐
                                        ▼ (No)                          ▼ (Yes)
                             [ Force Redirect to ]             [ Allow Access to ]
                             [ /app/onboarding   ]             [ /app/dashboard  ]
```

### Steps Sequence:
1. **User Sign Up:** User inputs name, email, and strong password. Zod validates criteria. Record inserted in `auth.users`.
2. **Email Verification:** System fires transactional activation link.
3. **Session Login:** Authenticates session, sets secure `HttpOnly` cookie tokens.
4. **Onboarding Wizard:** Collects timezone, language (`ar`/`en`), and theme. Configures first multi-tenant Organization, assigns role `OWNER`, updates JWT metadata with `onboarding_completed: true`.
5. **Dashboard Landing:** Middleware grants access to `/app/dashboard`.

---

## 2. Smart Task Creation & Lifecycle Flow

Managing tasks triggers optimistic UI changes, DB persistence, and asynchronous EventBus broadcasts:

```
[ User Inputs Task ] ➔ [ Optimistic UI Update ] ➔ [ Persist to DB / Sync Queue ]
                                                           │
                                                           ▼ (Success)
                                                   [ Publish to EventBus ]
                                                           │
                                          ┌────────────────┴────────────────┐
                                          ▼ (Listener 1)                    ▼ (Listener 2)
                                  [ Telemetry Log ]                 [ AI Planner Queue ]
```

### Flow Sequence:
1. **Trigger Modal:** Press `N` or click "+ Add Task".
2. **Input Fields:** Input title, description, priority, and status. Press `Ctrl+Enter` or click "Create".
3. **Optimistic Rendering:** The task is instantly rendered at the top of the list or inside its Kanban column.
4. **Persistence:**
   - *Online:* Saves to PostgreSQL via `TaskService.createTask`.
   - *Offline:* Saves to `SyncManager` offline queue.
5. **Broadcasting:** On database success, the `EventBus` broadcasts a `'TaskCreated'` event.
6. **Decoupled Handlers:** Telemetry logs the transaction; notification engines trigger alerts; AI planner indexes the task.
