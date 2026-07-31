# Cortex AI - Private Alpha Testing Plan

**Author:** QA Lead & Site Reliability Engineer  
**Status:** Certified for Alpha Launch  
**Version:** 1.0  
**Date:** July 28, 2026  

---

## 1. Objectives of the Private Alpha

The primary objective of this Phase 5 / Build Cycle 5 Private Alpha is to validate **E2E transactional integrity, data isolation, and cost auditing** on real cloud databases before public rollout:
1. **Security & RLS Isolation:** Confirm that no tenant can read, modify, or leak tasks/projects from other organizations.
2. **SaaS Workspace Wizard:** Confirm automated creation of organizations and memberships.
3. **AI Cost Controls:** Audit the cost-tracking adapters and token budget limits under active user workloads.
4. **Offline Synchronization:** Verify the IndexedDB offline sync queue resolves without transaction deadlocks.

---

## 2. Structured Test Scenarios

### Scenario A: Secure Registration & Onboarding Gate
- **Action:** New user registers via Magic Link or password, triggers the Onboarding Wizard to set Yemeni/Yemen timezone, language, and theme, and creates an organization.
- **Success Criteria:** `profiles` and `organizations` records are written; JWT metadata has `onboarding_completed: true`.

### Scenario B: AI Goal Generation & Planning
- **Action:** User enters a high-level goal, clicks "Transform to Roadmap", generating Projects, Milestones, and Tasks.
- **Success Criteria:** AI Gateway records token counts and dollar cost metrics; tasks list and timeline weeks render immediately.

### Scenario C: Cross-Tenant Protection (RLS Audit)
- **Action:** User A attempts to request or modify User B's task or private chat conversation by ID.
- **Success Criteria:** Supabase PostgreSQL rejects the query with an access infraction error, returned count is `0`.

---

## 3. Quota & Performance Budgets
- **Maximum Daily Token Budget:** 10,000 tokens for Free Alpha tier.
- **Maximum File Attachment Upload:** 10MB per file.
- **SLA Recovery Target:** RTO of 15 Minutes, RPO of 1 Hour.
