# 13. Core Domain Foundation & State Machine Architecture

**Author:** Chief Technology Officer & Principal Software Engineer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Task Domain Layer Structure

Cortex AI follows standard **Domain-Driven Design (DDD)** parameters. The Task domain is organized into decoupled layers:
- **Entities:** Rich interfaces representing real-world business models (`Task`, `SubTask`, `Checklist`, `Tag`, `Label`, `Reminder`, `Attachment`, `Comment`, `Activity`).
- **Repositories (`src/features/tasks/repositories/`):** Isolates database querying and operations from business logic. Uses our secure, in-memory Mock Repository for local staging.
- **Service Layer (`src/features/tasks/services/`):** Manages side effects, checks user authorization roles, and triggers telemetry activities during modifications.

---

## 2. Deterministic Task State Machine
To enforce absolute state consistency, state modifications are audited by our **Task State Machine** (`src/features/tasks/services/task-state-machine.ts`).

### Transition Matrix (مصفوفة الانتقالات):

| Current Status | Allowed Target Statuses | Illegal Targets (Throws Error) |
| :--- | :--- | :--- |
| **`INBOX`** | `PLANNED`, `ARCHIVED`, `COMPLETED` | `IN_PROGRESS`, `WAITING` |
| **`PLANNED`** | `IN_PROGRESS`, `WAITING`, `ARCHIVED`, `COMPLETED` | `INBOX` |
| **`IN_PROGRESS`** | `COMPLETED`, `WAITING`, `PLANNED`, `ARCHIVED` | `INBOX` |
| **`WAITING`** | `IN_PROGRESS`, `PLANNED`, `ARCHIVED`, `COMPLETED` | `INBOX` |
| **`COMPLETED`** | `PLANNED`, `ARCHIVED` | `INBOX`, `IN_PROGRESS`, `WAITING` |
| **`ARCHIVED`** | `INBOX`, `PLANNED` | `IN_PROGRESS`, `WAITING`, `COMPLETED` |

---

## 3. Core Domain Models

- **`ChecklistItem`:** Standard checklist title and complete status flag.
- **`SubTask`:** Mapped 1:M to its parent task to support tree breakdowns.
- **`Reminder`:** Standard scheduled reminder date and sent flags.
- **`Attachment` / `Comment`:** Standard file, size, uploaded by, and comment timestamps.
- **`Activity`:** Logs specific changes to task fields (e.g., changes to due date, description), serving as an audit trail.

---

## 4. Service Layer Specifications

To support business operations, the following specialized services are defined:
1. **`TaskService`:** Creates, updates, soft-deletes, and completes tasks, generating telemetry events dynamically.
2. **`ProjectService`:** Handles high-level milestones and workspace projects configuration.
3. **`GoalService`:** Transforms long-term targets and measures progress percentages.
4. **`NotificationService`:** Invokes browser pushes and Resend transactional emails.
5. **`ActivityService`:** Powers telemetry ingestion for user actions.

---

## 5. In-Memory Mock Repository Layout

To support rapid frontend prototyping before the physical Supabase database is populated, we deploy an in-memory **Mock Task Repository** (`src/features/tasks/repositories/mock-task-repository.ts`).
- Holds seeded tasks (`Deploy Database Schema with RLS`, `Setup GitHub Actions CI/CD Pipeline`) matching our `seed.ts` specifications.
- Implements standard CRUD methods (`getTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`).
- Seamlessly validates all state transition paths against the `TaskStateMachine` dynamically.
