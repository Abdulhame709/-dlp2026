# 13. Task UI & Drag-and-Drop Architecture

**Author:** Principal Frontend Engineer & UX Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Task Workspace Layouts & Views

The Smart Task Management Workspace (`src/app/app/tasks/page.tsx`) offers four responsive views powered by our reusable component library:

1. **List View:**
   - Designed for rapid scanning.
   - Displays task checkboxes, title, description, priority badges, and status indicators in clean rows.
   - Highlights completed tasks with a strikethrough.
2. **Kanban View:**
   - Organized into four columns mapping our core status workflow: `INBOX`, `PLANNED`, `IN_PROGRESS`, and `COMPLETED`.
   - Cards display titles, truncated descriptions, and priorities.
   - Built-in drag-and-drop enables cards to be dragged and dropped between columns, updating their database state instantly.
3. **Calendar View:**
   - Distributes tasks across a 7-day grid corresponding to days of the week, with truncated titles for streamlined visual scheduling.
4. **Timeline View:**
   - Gantt-like timeline row displays where task blocks are offset and sized representing active period intervals.

---

## 2. Sliding Task Details Drawer Panel
Clicking any task row or card instantly slides out the **Task Details Drawer** on the right:
- Displays title, description, and status dropdown.
- **Checklist Sub-Module:** Users can view, toggle completion of checklist items, or add new items.
- **Comments Thread:** Displays user comments with timestamps and allows posting new comments to capture context.
- **SRE Audit Activity Logs:** Tracks field modifications (`Priority: HIGH ➔ MEDIUM`) to feed the audit trail.

---

## 3. Keyboard Shortcuts Engine (`src/shared/hooks/use-shortcuts.ts`)
The workspace listens to keyboard events to enable fast operations without touching a mouse:
- **`N`:** Opens the Add New Task modal.
- **`E`:** Focuses and opens the active Task Details Drawer.
- **`Delete`:** Soft-deletes the selected task or triggers bulk deletion if items are selected.
- **`Ctrl+Enter`:** Submits and saves active form changes instantly.

---

## 4. Optimistic UI Updates & Offline Sync Pipeline
To guarantee zero-latency interaction times, all user mutations (creating, updating, completing, deleting) follow an **Optimistic Update Pattern**:
1. The UI instantly updates local state (e.g., hiding a deleted task, or moving a card).
2. If the user is online, the change is saved to the database. If a server error occurs, the UI state reverts to ensure accuracy.
3. If the user is offline, the **Sync Manager** (`src/core/utils/sync-manager.ts`) intercepts the action, queues the pending mutation in local storage, and automatically syncs all changes once the browser fires an `online` event.
