# 01. Product Overview (Cortex AI)

## 1. Product Vision & Value Proposition
Cortex AI is a next-generation, AI-native productivity operating system. Traditional productivity applications act as mere digital notebooks where the user carries 100% of the cognitive overhead of scheduling, organizing, and prioritizing tasks. Cortex AI flips this paradigm by acting as an intelligent executive assistant that plans, adapts, and tracks execution dynamically.

- **Primary Goal:** To reduce cognitive overhead and increase execution quality, helping individuals and teams transform high-level visions into optimized daily plans automatically.

---

## 2. Multi-Tenant Target Audience
From day one, the product is architected to support multiple tiers of multi-tenancy:
1. **Individual Users (Free/Pro):** Self-employed professionals, developers, students, and life-long learners operating in their personal workspace.
2. **Teams (Business):** Small-to-medium teams requiring shared projects, simple role delegation, and team-wide productivity tracking.
3. **Organizations & Enterprise:** Large-scale organizations with advanced role-based access control (RBAC), multi-team workspace isolation, SSO authentication, custom security audits, and dedicated billing structures.

---

## 3. Phased AI Implementation Roadmap (خارطة طريق الذكاء الاصطناعي)
To minimize token costs, manage architectural complexity, and deliver immediate value during the MVP launch, the intelligence engine is structured into four distinct phases:

### Phase 1: MVP (Basic AI Assistant)
* **Goal:** Core conversational task orchestration with zero context overhead.
* **Scope:** 
  - Natural Language Task Generation (e.g., converting "I need to prepare quarterly financial audit files within 2 weeks" into a detailed list of tasks).
  - Conversational assistant interface for basic tasks CRUD and simple daily suggestions.
  - No complex vector databases or long-term memory queries yet.

### Phase 2: V1.0 (Advanced AI Planner)
* **Goal:** Intelligent time scheduling and proactive planning.
* **Scope:** 
  - Automated scheduling of tasks into calendar slots based on user working hours and deadlines.
  - Dynamic rescheduling engine when a user misses a deadline or delays a task.
  - Proactive schedule conflicts warning.

### Phase 3: V2.0 (Dual Memory & RAG Integration)
* **Goal:** High personalization and semantic context search.
* **Scope:** 
  - Dual Memory System (Session-level short-term context + Postgres `pgvector` long-term memory storing preferences and historical habits).
  - Retrieval-Augmented Generation (RAG) connecting the AI to private knowledge notes and bookmarks.
  - Safe GDPR-compliant memory management dashboard (View/Edit/Erase memory vectors).

### Phase 4: V3.0 (AI Agent Framework)
* **Goal:** Autonomous background productivity management.
* **Scope:** 
  - Specialized background agents (Planning Agent, Research Agent, Project Agent, Coach Agent) executing workflows, auditing risks, and compiling autonomous research briefs.

---

## 4. MVP Core Scope
The MVP will focus on a rock-solid, production-grade subset of features:
- **Authentication:** Registration, Login, Reset Password, and Profile settings.
- **Multi-Tenant Dashboard:** An interactive workspace displaying daily priorities, completion graphs, and quick actions.
- **Smart Task Management:** Full CRUD operations on tasks, priority tags (Critical, High, Medium, Low), deadlines, and categories.
- **Basic AI Assistant:** Chat panel capable of generating a structured breakdown of a project or task list.
- **Basic Calendar Grid:** Visual day/week scheduling.
- **Basic Telemetry & Analytics:** Performance tracking of task completions.

---

## 5. Event Tracking & Telemetry Architecture (بنية تحليلات الأحداث)
To measure platform adoption and track user engagement natively, a central **Telemetry Service** is designed from day one. Every critical user or AI interaction generates an analytical event logged in PostgreSQL:

| Event Name | Triggering Action | Captured Metadata |
| :--- | :--- | :--- |
| `user_registered` | Account creation | Provider (Email/OAuth), Locale, Role |
| `user_created_task` | Task creation | Priority, Estimated Time, Creation Source (Manual vs. AI) |
| `task_completed` | Task marked completed | Actual Duration, Days Before/After Deadline |
| `ai_request_sent` | User submits chat or request | Prompt Token Size, Prompt Category, Performance Duration |
| `goal_created` | Goal is initialized | Milestones Count, Target Date |
| `feature_used` | User interacts with a specific UI view | View Name, Device Type |
