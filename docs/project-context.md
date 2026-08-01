# Cortex AI - Project Context & Architectural Topography

**Document Status:** Approved & Locked  
**Version:** v1.0.0  
**Target:** Future AI Sessions, Developers, & SRE Teams  

---

## 1. Product Vision & Value Proposition
Cortex AI is a next-generation **AI-native Productivity Operating System (SaaS + PWA)** designed to reduce cognitive overhead, automate schedule coordination, and optimize execution quality. 
Unlike reactive task managers, Cortex AI guides users through a comprehensive productivity journey:
`Idea ➔ Goal ➔ Project ➔ Milestones ➔ Tasks ➔ Execution ➔ Analytics ➔ Improvement`

---

## 2. Technology Stack & Selected Abstractions

| Layer | Technology | Operational Justification |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 + React 19 | Server Components (RSC) for page speed and built-in edge optimizations. |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Premium customizable theme variables with light/dark modes out of the box. |
| **State** | Zustand | Ultra-lightweight reactive stores for tasks and layout. |
| **Database** | Supabase (PostgreSQL) | Native RLS, Storage Buckets, and pgvector. |
| **ORM** | Prisma | Automated compile-time safe database migrations. |
| **AI Gateway** | Unified AI Gateway Wrapper | Cost-controlled token budget manager routing between OpenAI, Anthropic, Gemini, and Mock models. |

---

## 3. Database Schema Entities & Row Level Security

The database consists of **14 target PostgreSQL tables** managed via Prisma schema definitions:
1. `profiles`: Matches 1:1 with `auth.users(id)` and stores user timezones, locales, and preferences.
2. `organizations` / `organization_members`: Supports hierarchical, multi-tenant workspace isolation.
3. `projects` / `milestones`: High-level packages grouping tasks.
4. `tasks` / `checklist`: Primary executable productivity logs supporting Soft-Deletes.
5. `goals` / `goal_milestones`: Strategic targets with progress trackers.
6. `ai_conversations` / `ai_messages` / `ai_memory`: Traces chat histories and short-term and long-term memories.
7. `activity_logs`: Ingests high-frequency telemetry events (`TaskCreated`, `AI_REQUEST_USED`).
8. `feature_flags`: Controls the dynamic activation of features without rebuilds.
9. `subscriptions` / `payments`: Tracks Stripe plan billing details.
10. `audit_logs`: Registers administrative audit trails.

---

## 4. Completed Development Cycles

### Cycle 1: Architecture & UI App Shell (Phases 0 - 2A)
- Setup Next.js 15, strict TypeScript, Prettier, Tailwind v4, and shadcn/ui.
- Built the collapsible Sidebar, TopNav breadcrumbs, and Dashboard Widgets.

### Cycle 2: Core Domain, Auth & Onboarding (Phases 1A - 1B-B)
- Deployed database triggers for `updated_at` columns.
- Implemented Supabase Auth, secure cookies JWT middleware, and RoleGuard.
- Integrated the protected onboarding flow redirecting unconfigured profiles to `/app/onboarding`.

### Cycle 3: Smart Tasks Workspace & EventBus (Phases 2B - 2C)
- Designed the Task State Machine governing deterministic transitions.
- Built the Tasks Workspace supporting List, Kanban, Calendar, and Timeline views.
- Created the decentralized EventBus to broadcast events and decouple side-effects.

### Cycle 4: Analytics, AI Orchestrator & Memory (Phases 2E - 3B)
- Built the Analytics telemetry engine calculating productivity scores and weekly reports.
- Built the AI Prompt Engineering Framework with structured JSON Zod validators.
- Activated the conversational assistant and the long-term AI memory drawer.

### Cycle 5: Production Hardening, DI, & AI Coach (Phases 2D-A - v1.0.0)
- Implemented a complete Dependency Injection (`src/core/config/dependency-injector.ts`) layer to swap Mock and Supabase repositories seamlessly based on `USE_MOCK` environmental variable.
- Built the **AI Execution Coach & Daily AI Review Dashboard** to display recommended actions, and hourly plans.
- Upgraded local offline queues to use **asynchronous IndexedDB**.

---

## 5. Pending Next Steps (الخطوة التالية الموصى بها)
- Merge current working branch `arena/019fa52b-dlp2026` into `main`.
- Turn off `USE_MOCK` inside Vercel environment configurations.
- Execute `npx prisma migrate deploy` targeting the live Supabase PostgreSQL connection pool.
- Initiate Private Beta testing.
