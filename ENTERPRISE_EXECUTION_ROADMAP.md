# Cortex AI — Enterprise Execution Roadmap

**Document Classification:** Official Implementation Plan  
**Date:** 2026-08-01  
**Branch:** `arena/019fbe8f-dlp2026`  
**Source Evidence:** DISCOVERY_REPORT.md · EVIDENCE_VERIFICATION_REPORT.md · ENTERPRISE_AUDIT_REPORT.md  
**Methodology:** Dependency-ordered phase sequencing based on 35 verified findings  

---

## ROADMAP OVERVIEW

| Phase | Name | Resolves | Complexity | Est. Time |
|-------|------|----------|------------|-----------|
| 1 | Security Emergency Fixes | C6, C1, C2, C3, C4, C5, H14 | High | 3 days |
| 2 | Database Completion | B1, B2, B3, B4, B5, B6, B7 | High | 4 days |
| 3 | Authentication & Authorization Hardening | C1-deep, H15, H12 | Medium | 3 days |
| 4 | API Hardening | C3-deep, C4-deep, C5-deep, H13 | Medium | 3 days |
| 5 | AI Infrastructure Completion | E1, E2, B1-deep, B2-deep, B3-deep | High | 5 days |
| 6 | Realtime Infrastructure | §9.7, B4-deep | High | 4 days |
| 7 | Billing Integration | B5-deep, H10, §9.2, §9.3 | High | 5 days |
| 8 | Notifications & Audit | B4-deep, B6-deep, H9, H1, H13-deep | Medium | 3 days |
| 9 | File Storage | H2, §9.8 | Medium | 2 days |
| 10 | Performance Optimization | D1, §5.5, §4.2–4.5, H16 | High | 5 days |
| 11 | Testing Infrastructure | §7.1–7.4 | High | 5 days |
| 12 | CI/CD & DevOps | F1, §6.3–6.7 | Medium | 3 days |
| 13 | Observability & Monitoring | §6.5–6.6, §9.9 | Medium | 3 days |
| 14 | Enterprise SaaS Completion | §9.1–9.9, H3-H8, H11 | Medium | 4 days |
| 15 | Production Readiness Validation | All | Low | 2 days |

**Total Estimated Effort:** 54 days (≈ 11 weeks for a single engineer; 6 weeks with 2 engineers)

---

## PHASE 1 — Security Emergency Fixes

### Objective
Eliminate all CRITICAL security vulnerabilities that would allow immediate compromise if the application were deployed.

### Why This Phase Comes Now
Hardcoded database credentials (C6) and missing API authentication (C1) are active exploitation vectors. Every day these remain in the repository is a day of risk. Security utilities that exist but are never called (C3, C4, C5) provide zero protection until wired in. This is the single highest-priority phase.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| C6 | Hardcoded DB credentials in `scripts/deploy-migrations.js` line 5 | CRITICAL |
| C1 | Hardcoded userId in API routes `src/app/api/v1/tasks/route.ts` lines 18, 39 | CRITICAL |
| C2 | No admin route protection in `src/app/app/admin/page.tsx` | HIGH |
| C3 | `applySecurityHeaders()` never called — defined in `src/core/security/security-utils.ts` line 43 | HIGH |
| C4 | `isRateLimited()` never called — defined in `src/core/security/security-utils.ts` line 10 | HIGH |
| C5 | `verifyCSRF()` never called — defined in `src/core/security/security-utils.ts` line 62 | HIGH |
| H14 | `deploy-migrations.js` line 2: `const path = require('fs')` should be `require('path')` | LOW |

### Exact Files Modified
| File | Change |
|------|--------|
| `scripts/deploy-migrations.js` | Remove hardcoded connection string; read from environment variable; fix line 2 typo |
| `src/app/api/v1/tasks/route.ts` | Replace hardcoded userId with `supabase.auth.getUser()` session resolution |
| `src/app/api/v1/ai/route.ts` | Add session auth check |
| `src/app/api/v1/analytics/route.ts` | Add session auth check |
| `src/app/api/v1/auth/route.ts` | Add session auth check |
| `src/app/api/v1/health/route.ts` | No auth needed (public health check) |
| `src/app/api/v1/organizations/route.ts` | Add session auth check |
| `src/app/api/v1/projects/route.ts` | Add session auth check |
| `src/middleware.ts` | Add security headers via `applySecurityHeaders()`; add rate limiting check; add admin role guard for `/app/admin` |
| `src/core/config/env.ts` | Add `DIRECT_URL` env variable for migration script |

### New Files Created
| File | Purpose |
|------|---------|
| `src/core/auth/middleware-auth.ts` | Shared helper for extracting authenticated user from middleware request |

### Database Changes
None.

### API Changes
- All 6 protected API routes now require valid Supabase session
- Unauthenticated requests return 401
- Rate limiting applied to all `/api/v1/` routes
- CSRF verification applied to POST/PUT/DELETE routes

### UI Changes
None.

### Security Changes
- Database credentials removed from source code
- All API routes enforce authentication
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) applied to all responses
- Rate limiting (20 requests/minute per IP) enforced on API routes
- CSRF verification on all mutation endpoints
- Admin route `/app/admin` requires OWNER/ADMIN role in middleware

### Estimated Complexity
**High** — Touches the middleware (critical path), all API routes, and a deployment script

### Estimated Implementation Time
3 days

### Expected Production Impact
Eliminates the 5 most critical security vulnerabilities. The application becomes safe to deploy behind authentication.

### Risks
- Middleware changes affect every request — regression risk
- Rate limiting configuration must be tuned to avoid blocking legitimate traffic
- CSRF check may block valid cross-origin requests if not properly configured

### Dependencies
None — this is the first phase.

### Validation Checklist
- [ ] `grep -rn "8abduh772641299" scripts/` returns zero results
- [ ] `grep -rn "11111111-1111-1111-1111-111111111111" src/app/api/` returns zero results
- [ ] Unauthenticated API request returns 401
- [ ] Security headers present on all responses (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting triggers after 20 requests in 60 seconds
- [ ] CSRF check blocks requests without valid origin/referer
- [ ] `/app/admin` redirects non-admin users
- [ ] `scripts/deploy-migrations.js` reads connection string from env

### Definition of Done
- Zero hardcoded credentials in the repository
- Zero hardcoded userId in API routes
- All 3 security utilities (`applySecurityHeaders`, `isRateLimited`, `verifyCSRF`) are wired into middleware/routes
- Admin route is protected by role check
- Migration script reads credentials from environment

---

## PHASE 2 — Database Completion

### Objective
Create all 6 missing database tables with proper schemas, indexes, RLS policies, and Prisma models so that the Supabase repository implementations can function when `USE_MOCK=false`.

### Why This Phase Comes Now
Phase 1 secured the application. Phase 2 creates the data foundation that all subsequent phases depend on. Without these tables, the AI conversation system (B1, B2), AI memory (B3), notifications (B4), billing (B5), and audit logging (B6) cannot function in production mode. Every feature phase after this depends on these tables existing.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| B1 | Missing `ai_conversations` table — `src/features/ai/chat/supabase-conversation-repository.ts` lines 36, 67, 91, 112, 126 | CRITICAL |
| B2 | Missing `ai_messages` table — same file, lines 48, 76, 137, 154 | CRITICAL |
| B3 | Missing `ai_memory` table — `src/features/ai/core/supabase-ai-memory-repository.ts` lines 26, 47, 65, 77 | HIGH |
| B4 | Missing `notifications` table — `src/features/notifications/supabase-notification-repository.ts` lines 22, 41, 64 | HIGH |
| B5 | Missing `subscriptions` table — `src/features/billing/supabase-billing-repository.ts` lines 20, 48 | HIGH |
| B6 | Missing `audit_logs` table — `src/core/monitoring/audit-logger.ts` line 31 | MEDIUM |
| B7 | Feature flags RLS is permissive — `migration.sql` line 308 | LOW |

### Exact Files Modified
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add 6 new models with proper types, indexes, and relations |

### New Files Created
| File | Purpose |
|------|---------|
| `prisma/migrations/YYYYMMDD_add_ai_conversations_and_messages/migration.sql` | Create `ai_conversations` and `ai_messages` tables with RLS |
| `prisma/migrations/YYYYMMDD_add_ai_memory/migration.sql` | Create `ai_memory` table with RLS |
| `prisma/migrations/YYYYMMDD_add_notifications/migration.sql` | Create `notifications` table with RLS |
| `prisma/migrations/YYYYMMDD_add_subscriptions/migration.sql` | Create `subscriptions` table with RLS |
| `prisma/migrations/YYYYMMDD_add_audit_logs/migration.sql` | Create `audit_logs` table with RLS |

### Database Changes
6 new tables with the following schemas:

**ai_conversations:**
- `id` UUID PK, `user_id` UUID FK→profiles, `title` VARCHAR(255), `category` VARCHAR(50), `is_archived` BOOLEAN DEFAULT false, `created_at`, `updated_at`, `deleted_at` (soft delete), audit fields
- Indexes: `user_id`, `deleted_at` (partial)
- RLS: user can only see own conversations

**ai_messages:**
- `id` UUID PK, `conversation_id` UUID FK→ai_conversations (CASCADE), `role` VARCHAR(20), `content` TEXT, `rating` VARCHAR(10), `created_at`
- Indexes: `conversation_id`, `created_at`
- RLS: user can only see messages in own conversations

**ai_memory:**
- `id` UUID PK, `user_id` UUID FK→profiles (CASCADE), `memory_type` VARCHAR(50), `content` TEXT, `importance_score` INT, `created_at`, `updated_at`
- Indexes: `user_id`, `memory_type`
- RLS: user can only access own memories

**notifications:**
- `id` UUID PK, `user_id` UUID FK→profiles (CASCADE), `title` VARCHAR(255), `message` TEXT, `type` VARCHAR(20), `read_status` BOOLEAN DEFAULT false, `action_url` VARCHAR(512), `created_at`
- Indexes: `user_id`, `read_status`
- RLS: user can only see own notifications

**subscriptions:**
- `id` UUID PK, `user_id` UUID FK→profiles (UNIQUE), `plan_name` VARCHAR(50), `status` VARCHAR(20), `start_date` TIMESTAMPTZ, `end_date` TIMESTAMPTZ, `created_at`, `updated_at`
- Indexes: `user_id` (unique), `status`
- RLS: user can only see own subscription

**audit_logs:**
- `id` UUID PK, `user_id` UUID FK→profiles, `action` VARCHAR(100), `entity_type` VARCHAR(50), `entity_id` UUID, `old_value` TEXT, `new_value` TEXT, `created_at`
- Indexes: `user_id`, `entity_type`, `action`, `created_at`
- RLS: admin-only read; user can insert own logs

### API Changes
None — existing Supabase repositories will automatically work once tables exist.

### UI Changes
None.

### Security Changes
- RLS policies on all 6 new tables
- `SECURITY DEFINER` helper functions for conversation access (user owns conversation → can read messages)
- `audit_logs` restricted to admin-only SELECT

### Estimated Complexity
**High** — 6 tables, each with indexes, RLS, and foreign keys; must not break existing 8 tables

### Estimated Implementation Time
4 days

### Expected Production Impact
Unlocks all Supabase repository implementations. When `USE_MOCK=false`, AI conversations, AI memory, notifications, billing, and audit logging will function against real PostgreSQL.

### Risks
- Migration must be applied to existing Supabase instance without breaking existing data
- RLS policy errors could lock out legitimate users
- Foreign key constraints on `ai_conversations.user_id` must match existing profiles

### Dependencies
- Phase 1 (credentials removed from deploy script — migration script must work with env vars)

### Validation Checklist
- [ ] `npx prisma migrate status` shows all migrations applied
- [ ] `npx prisma generate` succeeds with 14 models
- [ ] RLS is enabled on all 6 new tables
- [ ] `is_org_member()` and `is_org_admin()` functions still work
- [ ] Existing 8 tables unaffected by new migrations
- [ ] `SELECT * FROM ai_conversations` as authenticated user returns empty (not error)
- [ ] `SELECT * FROM ai_messages` as authenticated user returns empty (not error)
- [ ] `SELECT * FROM audit_logs` as non-admin user returns empty (not error)

### Definition of Done
- All 6 tables exist in the database with proper schemas
- Prisma schema contains 14 models
- All tables have RLS enabled with appropriate policies
- `SupabaseConversationRepository` can execute queries without error
- `SupabaseAIMemoryRepository` can execute queries without error
- `SupabaseNotificationRepository` can execute queries without error
- `SupabaseBillingRepository` can execute queries without error
- `AuditLogger` can insert records without error

---

## PHASE 3 — Authentication & Authorization Hardening

### Objective
Replace all hardcoded/default userId patterns with proper session resolution, make settings page functional, and enforce role-based access control in the application layer.

### Why This Phase Comes Now
Phase 1 fixed API-level auth. Phase 2 created the database tables. Phase 3 ensures the application layer (UI, services, pages) properly resolves user identity and enforces authorization. Without this, pages still default to the hardcoded UUID and the RoleGuard/PermissionManager are unused.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| C1-deep | Hardcoded userId `'11111111-1111-1111-1111-111111111111'` as default state in 12+ page components | HIGH |
| H12 | Settings page "Save Preferences" button has no handler — `src/app/app/settings/page.tsx` lines 104-107 | MEDIUM |
| H15 | Default userId everywhere — if `AuthService.getCurrentUser()` fails silently, app operates as wrong user | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/app/app/dashboard/page.tsx` | Replace hardcoded default userId with null/undefined; add auth guard; redirect if unauthenticated |
| `src/app/app/tasks/page.tsx` | Same pattern |
| `src/app/app/ai-assistant/page.tsx` | Same pattern |
| `src/app/app/goals/page.tsx` | Same pattern |
| `src/app/app/projects/page.tsx` | Same pattern |
| `src/app/app/notifications/page.tsx` | Same pattern |
| `src/app/app/billing/page.tsx` | Same pattern |
| `src/app/app/organizations/page.tsx` | Same pattern |
| `src/app/app/settings/page.tsx` | Replace read-only divs with editable inputs; wire Save button to SettingsService; add form handler |
| `src/app/app/feedback/page.tsx` | Same userId pattern |
| `src/shared/components/layout/sidebar.tsx` | Remove hardcoded default role; use proper role resolution |
| `src/shared/stores/layout-store.ts` | Remove hardcoded default org ID `'22222222-2222-2222-2222-222222222222'` |

### New Files Created
| File | Purpose |
|------|---------|
| `src/shared/hooks/use-auth.ts` | Shared hook for authenticated user resolution with loading/error states |
| `src/app/app/settings/actions.ts` | Server action for saving settings preferences |

### Database Changes
None (tables already exist from Phase 2).

### API Changes
None.

### UI Changes
- Settings page: read-only `<div>` elements replaced with editable `<input>` elements
- Settings page: "Save Preferences" button calls server action
- All pages: loading state shown while user identity resolves; no default userId
- Sidebar: role dynamically resolved from organization membership

### Security Changes
- No page operates with a default/fallback userId
- Unauthenticated state is handled explicitly (redirect or show login)
- Settings mutations require authenticated session

### Estimated Complexity
**Medium** — Repetitive pattern across 12 files but same fix each time

### Estimated Implementation Time
3 days

### Expected Production Impact
Every page now operates with the correct user identity. Settings page becomes functional. No more silent fallback to a shared user.

### Risks
- Pages may flash loading state longer if auth resolution is slow
- Some pages may break if they expect userId to always be available
- Settings save may fail if profile record doesn't exist yet

### Dependencies
- Phase 1 (API auth already fixed)
- Phase 2 (tables exist for settings persistence)

### Validation Checklist
- [ ] `grep -rn "11111111-1111-1111-1111-111111111111" src/app/app/` returns zero results
- [ ] `grep -rn "22222222-2222-2222-2222-222222222222" src/` returns zero results
- [ ] Unauthenticated user is redirected to login from any `/app/` page
- [ ] Settings page Save button persists changes to database
- [ ] Settings page shows editable inputs, not read-only divs
- [ ] Sidebar role is resolved from organization membership, not hardcoded

### Definition of Done
- Zero hardcoded userId or orgId defaults in any page component
- All pages resolve user identity from session
- Settings page is fully functional (read + write)
- Sidebar shows correct role-based navigation

---

## PHASE 4 — API Hardening

### Objective
Deepen the integration of security utilities into every API route, add proper error handling, add input validation, and make the admin page data-driven with real backend queries.

### Why This Phase Comes Now
Phase 1 wired security utilities into middleware. Phase 3 fixed UI-level auth. Phase 4 now ensures every API route has proper validation, rate limiting, CSRF, and that the admin page calls real services instead of using hardcoded data.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| H13 | Admin page uses hardcoded data — `src/app/app/admin/page.tsx` lines 27-36 | MEDIUM |
| C3-deep | Security headers need per-route customization (not just middleware) | HIGH |
| C4-deep | Rate limiting needs per-route configuration (stricter for AI, looser for health) | HIGH |
| C5-deep | CSRF verification needs per-route application | HIGH |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/app/api/v1/ai/route.ts` | Add rate limiting (stricter — 10 req/min), input validation, CSRF, auth |
| `src/app/api/v1/analytics/route.ts` | Add auth, rate limiting, input validation |
| `src/app/api/v1/auth/route.ts` | Add rate limiting (stricter — 5 req/min), input validation |
| `src/app/api/v1/organizations/route.ts` | Add auth, input validation, CSRF |
| `src/app/api/v1/projects/route.ts` | Add auth, input validation, CSRF |
| `src/app/api/v1/tasks/route.ts` | Add rate limiting, input validation, CSRF |
| `src/app/app/admin/page.tsx` | Replace hardcoded data with real service calls; add admin role guard |

### New Files Created
| File | Purpose |
|------|---------|
| `src/core/api/rate-limit-config.ts` | Per-route rate limit configuration |
| `src/core/api/api-validator.ts` | Shared Zod validation schemas for API inputs |
| `src/core/api/with-api-security.ts` | Higher-order function wrapping API handlers with auth, rate limit, CSRF, validation |
| `src/app/api/v1/admin/route.ts` | Admin API endpoint for system stats, audit logs, AI quota |

### Database Changes
None.

### API Changes
- All routes wrapped with `with-api-security()` providing auth, rate limiting, CSRF, validation
- New `/api/v1/admin` endpoint for admin dashboard data
- Per-route rate limit configuration (AI: 10/min, Auth: 5/min, Tasks: 20/min, Health: none)

### UI Changes
- Admin page fetches real data from `/api/v1/admin` instead of hardcoded arrays
- Admin page shows real system metrics (user count, org count, AI requests, health)

### Security Changes
- Every API route has explicit auth check
- Rate limiting is configurable per route
- CSRF verification on all mutation routes
- Input validation via Zod schemas on all request bodies
- Admin API requires admin role

### Estimated Complexity
**Medium** — Pattern-based implementation across 6 routes + 1 new route

### Estimated Implementation Time
3 days

### Expected Production Impact
All API routes are hardened with defense-in-depth. Admin page shows real data. No unauthenticated or unvalidated API access.

### Risks
- Rate limiting may be too aggressive for some use cases
- `with-api-security` wrapper pattern may add latency to each request
- Admin API may expose sensitive metrics if not properly protected

### Dependencies
- Phase 1 (security utilities wired)
- Phase 2 (audit_logs table exists)
- Phase 3 (auth resolution works)

### Validation Checklist
- [ ] All API routes return 401 for unauthenticated requests
- [ ] Rate limiting triggers at configured thresholds per route
- [ ] CSRF check blocks cross-origin POST requests
- [ ] Invalid input bodies return 400 with Zod validation errors
- [ ] Admin page shows real data from database
- [ ] Non-admin user cannot access `/api/v1/admin`
- [ ] `/api/v1/health` still works without auth

### Definition of Done
- All API routes have auth, rate limiting, CSRF, and input validation
- Admin page is data-driven
- No hardcoded data in any API response
- Per-route rate limiting is configurable

---

## PHASE 5 — AI Infrastructure Completion

### Objective
Replace all AI provider stubs with real API integrations, implement streaming, add fallback/retry logic, and wire the AI memory and conversation repositories to the database.

### Why This Phase Comes Now
Phase 2 created the `ai_conversations`, `ai_messages`, and `ai_memory` tables. Phase 3 fixed user identity resolution. Phase 4 hardened the API. Now the AI infrastructure can be completed with real providers, real persistence, and real streaming.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| E1 | All AI provider adapters are stubs — `src/features/ai/core/ai-gateway.ts` lines 4-50 | CRITICAL |
| E2 | `generateStructuredOutput()` throws on all real providers — lines 14, 33, 52 | CRITICAL |
| B1-deep | `ai_conversations` table exists but SupabaseConversationRepository not wired to DI | HIGH |
| B2-deep | `ai_messages` table exists but SupabaseConversationRepository not wired to DI | HIGH |
| B3-deep | `ai_memory` table exists but SupabaseAIMemoryRepository not wired to DI | HIGH |
| §5.5 | No AI streaming implementation | HIGH |
| §5.7 | No fallback or retry logic | HIGH |
| §5.8 | No AI output content filtering | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/features/ai/core/ai-gateway.ts` | Replace stub OpenAIAdapter, AnthropicAdapter, GoogleAIAdapter with real SDK calls; implement `generateStructuredOutput()` |
| `src/core/config/dependency-injector.ts` | Add `getAIMemoryRepository()` method |
| `src/features/ai/memory/long-term-memory.ts` | Switch from in-memory Map to SupabaseAIMemoryRepository via DI |
| `src/features/ai/chat/conversation-service.ts` | Already wired via DI — will work once tables exist |
| `src/features/ai/core/ai-service.ts` | Add retry logic with exponential backoff; add provider fallback chain |
| `src/features/ai/core/ai-provider-interface.ts` | Add `streamCompletion()` method to interface |
| `src/features/ai/core/AIAssistantService.ts` | Add streaming support for chat responses |
| `src/app/app/ai-assistant/page.tsx` | Add streaming UI (token-by-token display) |
| `src/app/api/v1/ai/route.ts` | Add streaming response endpoint |

### New Files Created
| File | Purpose |
|------|---------|
| `src/features/ai/core/openai-provider.ts` | Real OpenAI SDK integration using `openai` package |
| `src/features/ai/core/anthropic-provider.ts` | Real Anthropic SDK integration |
| `src/features/ai/core/gemini-provider.ts` | Real Google AI SDK integration |
| `src/features/ai/core/ai-fallback-chain.ts` | Fallback chain: OPENAI → ANTHROPIC → GEMINI → MOCK |
| `src/features/ai/core/ai-retry.ts` | Retry logic with exponential backoff and jitter |
| `src/features/ai/core/ai-output-filter.ts` | Content filtering for AI outputs (PII detection, toxicity) |
| `src/features/ai/core/streaming-adapter.ts` | Streaming adapter for SSE/ReadableStream responses |

### Database Changes
None (tables already exist from Phase 2).

### API Changes
- `/api/v1/ai` POST endpoint supports streaming responses via SSE
- AI requests include retry and fallback logic
- AI responses include content filtering

### UI Changes
- AI Assistant page shows streaming token-by-token responses
- AI tool results appear progressively
- Thinking indicator replaced with streaming progress

### Security Changes
- AI output content filtering (PII, toxicity, harmful content)
- AI cost quotas enforced per request
- Provider API keys stored in environment variables only

### Estimated Complexity
**High** — Real SDK integration, streaming protocol, fallback chain, retry logic

### Estimated Implementation Time
5 days

### Expected Production Impact
The AI system becomes functional with real intelligence. Conversations and memories persist to the database. Streaming provides responsive UX. Fallback and retry ensure reliability.

### Risks
- AI provider API keys may not be available in all environments
- Streaming implementation may have browser compatibility issues
- Cost overruns if quotas are not properly enforced
- Provider API changes may break adapters

### Dependencies
- Phase 2 (ai_conversations, ai_messages, ai_memory tables exist)
- Phase 3 (user identity resolution works)
- Phase 4 (AI API route is secured)

### Validation Checklist
- [ ] `AIGateway.getProvider()` returns real provider when API key is configured
- [ ] `generateStructuredOutput()` returns validated Zod-parsed data
- [ ] Streaming works in AI Assistant chat (token-by-token display)
- [ ] Fallback chain activates when primary provider fails
- [ ] Retry logic retries transient failures with exponential backoff
- [ ] AI conversations persist to `ai_conversations` and `ai_messages` tables
- [ ] AI memories persist to `ai_memory` table
- [ ] Cost quota is enforced before each request
- [ ] Output filter blocks harmful content
- [ ] Mock provider still works when `USE_MOCK=true`

### Definition of Done
- Real AI providers make actual API calls
- `generateStructuredOutput()` works on all providers
- Streaming works for chat responses
- Fallback chain provides resilience
- Conversations and memories persist to PostgreSQL
- Cost quotas are enforced
- Output filtering is active

---

## PHASE 6 — Realtime Infrastructure

### Objective
Implement Supabase Realtime subscriptions for live updates across tasks, notifications, and conversations, enabling multi-user collaboration.

### Why This Phase Comes Now
Phase 2 created the tables. Phase 3 fixed auth. Phase 5 completed AI. Realtime is the next critical feature for a collaborative SaaS — without it, users must refresh to see changes. This is especially important for the AI Assistant (live responses) and notifications (instant delivery).

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| §9.7 | No Supabase Realtime subscriptions — zero implementation of `channel()`, `onPostgresChanges()`, or WebSocket listeners | HIGH |
| B4-deep | Notifications table exists but no realtime push | HIGH |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/app/app/tasks/page.tsx` | Add realtime subscription for task updates (create, update, delete) |
| `src/app/app/notifications/page.tsx` | Add realtime subscription for new notifications |
| `src/app/app/ai-assistant/page.tsx` | Add realtime subscription for AI response streaming |
| `src/app/app/dashboard/page.tsx` | Add realtime subscription for metrics updates |
| `src/shared/components/layout/top-nav.tsx` | Add realtime notification badge counter |

### New Files Created
| File | Purpose |
|------|---------|
| `src/core/realtime/realtime-manager.ts` | Centralized Supabase Realtime subscription manager |
| `src/shared/hooks/use-realtime-subscription.ts` | React hook for managing realtime subscriptions |
| `src/shared/hooks/use-realtime-notifications.ts` | React hook for notification badge counter |

### Database Changes
- Enable Realtime on `tasks`, `notifications`, `ai_messages` tables via Supabase dashboard
- Configure RLS-aware Realtime broadcasts

### API Changes
None — Realtime uses WebSocket subscriptions, not REST API.

### UI Changes
- Tasks page updates in real-time when other users modify tasks
- Notifications badge in top-nav updates instantly
- AI Assistant shows streaming responses
- Dashboard metrics refresh automatically

### Security Changes
- Realtime subscriptions respect RLS policies — users only see data they're authorized to see
- Channel subscriptions are scoped to user ID and organization ID

### Estimated Complexity
**High** — Realtime subscriptions require careful lifecycle management, reconnection logic, and RLS alignment

### Estimated Implementation Time
4 days

### Expected Production Impact
Multi-user collaboration becomes possible. Users see changes from other team members instantly. Notifications appear in real-time. AI responses stream live.

### Risks
- Realtime may not work in all network environments (firewalls, proxies)
- WebSocket connections may increase server load
- Reconnection logic must handle offline/online transitions
- RLS misconfiguration could leak data through Realtime

### Dependencies
- Phase 2 (tables exist)
- Phase 3 (auth resolution works — subscriptions need user ID)
- Phase 5 (AI streaming)

### Validation Checklist
- [ ] Task created by User A appears instantly for User B
- [ ] Notification badge updates without page refresh
- [ ] AI Assistant shows streaming response
- [ ] Realtime subscriptions respect RLS — User A cannot see User B's private tasks
- [ ] Subscriptions are cleaned up on component unmount
- [ ] Reconnection works after network interruption

### Definition of Done
- Realtime subscriptions work for tasks, notifications, and AI messages
- RLS policies are enforced on Realtime broadcasts
- UI updates in real-time without manual refresh
- Subscriptions are properly managed (subscribe/unsubscribe lifecycle)

---

## PHASE 7 — Billing Integration

### Objective
Replace the mock billing system with real Stripe integration, wire the billing page to the database, and make subscription management functional.

### Why This Phase Comes Now
Phase 2 created the `subscriptions` table. Phase 3 fixed user identity. Phase 4 hardened the API. Phase 6 added realtime. Now billing can be completed with real Stripe integration, making the SaaS monetization model functional.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| B5-deep | `subscriptions` table exists but SupabaseBillingRepository not wired to DI | HIGH |
| H10 | Billing page uses local state — `src/app/app/billing/page.tsx` lines 82-87 | MEDIUM |
| H3 | `SupabaseBillingRepository` is dead code | LOW |
| H7 | `StripeProductionAdapter` is dead code | LOW |
| §9.2 | Subscription readiness — architecture designed but not implemented | MEDIUM |
| §9.3 | Billing readiness — no Stripe SDK integration | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/features/billing/stripe-adapter.ts` | Replace stub with real Stripe SDK integration using `stripe` package |
| `src/features/billing/subscription-service.ts` | Replace in-memory Map with SupabaseBillingRepository via DI |
| `src/features/billing/mock-payment-provider.ts` | Keep as fallback for mock mode |
| `src/app/app/billing/page.tsx` | Replace local state with SubscriptionService calls; wire upgrade button to Stripe checkout |
| `src/core/config/dependency-injector.ts` | Add `getBillingRepository()` method |

### New Files Created
| File | Purpose |
|------|---------|
| `src/app/api/v1/billing/checkout/route.ts` | Create Stripe checkout session API endpoint |
| `src/app/api/v1/billing/webhook/route.ts` | Stripe webhook handler for subscription events |
| `src/app/api/v1/billing/portal/route.ts` | Stripe Customer Portal for subscription management |
| `src/features/billing/billing-service.ts` | Business logic layer for billing operations |

### Database Changes
None (table already exists from Phase 2).

### API Changes
- `POST /api/v1/billing/checkout` — creates Stripe checkout session
- `POST /api/v1/billing/webhook` — receives Stripe webhook events
- `POST /api/v1/billing/portal` — creates Stripe Customer Portal session

### UI Changes
- Billing page shows real subscription status from database
- "Upgrade to PRO" button creates real Stripe checkout session
- Active plan indicator reflects real subscription status
- Payment success/cancel redirect handling

### Security Changes
- Webhook signature verification using Stripe signing secret
- Checkout session creation requires authenticated user
- Subscription status is server-authoritative (not client state)

### Estimated Complexity
**High** — Stripe integration, webhook handling, subscription state management

### Estimated Implementation Time
5 days

### Expected Production Impact
Revenue generation becomes possible. Users can upgrade to paid plans. Subscription state persists in the database.

### Risks
- Stripe API key may not be available in all environments
- Webhook events may arrive out of order
- Subscription state must be kept in sync between Stripe and database
- Edge cases: payment failures, subscription cancellations, refunds

### Dependencies
- Phase 2 (subscriptions table exists)
- Phase 3 (user identity resolution)
- Phase 4 (API security, rate limiting, CSRF)

### Validation Checklist
- [ ] "Upgrade to PRO" button creates real Stripe checkout session
- [ ] Stripe webhook events update subscription status in database
- [ ] Billing page shows real subscription status
- [ ] Webhook signature verification passes
- [ ] Subscription downgrade works via Stripe Customer Portal
- [ ] Mock mode still works when Stripe key is not configured

### Definition of Done
- Real Stripe checkout creates payment sessions
- Webhook events are processed and stored
- Subscription status is persisted in the database
- Billing page reflects real subscription state
- Mock mode still works without Stripe keys

---

## PHASE 8 — Notifications & Audit

### Objective
Wire the notifications system to the database, make the notifications page data-driven, activate the AuditLogger, and implement a notification delivery system.

### Why This Phase Comes Now
Phase 2 created the `notifications` and `audit_logs` tables. Phase 6 added realtime. Now notifications can be persisted, delivered in real-time, and audit logging can be activated.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| B4-deep | `notifications` table exists but SupabaseNotificationRepository not wired to DI | HIGH |
| B6-deep | `audit_logs` table exists but AuditLogger is dead code | MEDIUM |
| H9 | Notifications page uses hardcoded alerts — `src/app/app/notifications/page.tsx` lines 27-31 | MEDIUM |
| H1 | `AuditLogger` is dead code — zero production imports | LOW |
| H4 | `SupabaseNotificationRepository` is dead code | LOW |
| H13-deep | Admin page needs real audit log data | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/features/notifications/notification-service.ts` | Replace in-memory array with SupabaseNotificationRepository via DI |
| `src/core/monitoring/audit-logger.ts` | Wire to production code — add calls in TaskService, OrganizationService, AuthService |
| `src/app/app/notifications/page.tsx` | Replace hardcoded alerts with NotificationService calls; add realtime subscription |
| `src/core/config/dependency-injector.ts` | Add `getNotificationRepository()` method |
| `src/features/tasks/services/task-service.ts` | Add AuditLogger calls for task mutations |
| `src/core/auth/onboarding-service.ts` | Add AuditLogger calls for onboarding events |
| `src/features/organizations/organization-service.ts` | Add AuditLogger calls for member changes |

### New Files Created
| File | Purpose |
|------|---------|
| `src/features/notifications/notification-events.ts` | Domain event → notification mapping (e.g., TaskCreated → notification for assignee) |
| `src/app/api/v1/notifications/route.ts` | Notifications API endpoint |

### Database Changes
None (tables already exist from Phase 2).

### API Changes
- `GET /api/v1/notifications` — fetch user notifications
- `PATCH /api/v1/notifications/:id` — mark as read

### UI Changes
- Notifications page shows real notifications from database
- "Mark All Read" button calls NotificationService
- Real-time notification badge in top-nav
- Admin page shows real audit log entries

### Security Changes
- AuditLogger records sensitive operations (password changes, role changes, member removals)
- Notifications are scoped to user via RLS

### Estimated Complexity
**Medium** — Wiring existing services to database; event-driven notification triggers

### Estimated Implementation Time
3 days

### Expected Production Impact
Notifications work with real data. Audit trail exists for security-sensitive operations. Admin page shows real audit logs.

### Risks
- High notification volume may overwhelm users
- AuditLogger calls may add latency to mutations
- Notification events may need deduplication

### Dependencies
- Phase 2 (notifications and audit_logs tables exist)
- Phase 6 (realtime for instant notification delivery)

### Validation Checklist
- [ ] Notifications page shows real data from database
- [ ] "Mark All Read" persists to database
- [ ] AuditLogger records appear in `audit_logs` table
- [ ] Task creation/deletion triggers audit log entry
- [ ] Password change triggers audit log entry
- [ ] Member role change triggers audit log entry
- [ ] Admin page shows real audit log entries

### Definition of Done
- NotificationService reads from and writes to the database
- AuditLogger is called in all security-sensitive operations
- Notifications page is data-driven
- Admin page shows real audit logs
- Realtime delivers new notifications instantly

---

## PHASE 9 — File Storage

### Objective
Replace the mock FileService with real Supabase Storage integration for file uploads.

### Why This Phase Comes Now
Phase 2 created the database foundation. Phase 4 hardened the API. File storage is a lower-priority feature that can now be built on the secure, authenticated infrastructure.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| H2 | `FileService` is dead code — zero production imports outside tests | LOW |
| §9.8 | No Supabase Storage integration — `src/features/files/file-service.ts` line 43 returns mock URL | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/features/files/file-service.ts` | Replace mock URL generation with real Supabase Storage upload; add download/delete methods |

### New Files Created
| File | Purpose |
|------|---------|
| `src/app/api/v1/files/upload/route.ts` | File upload API endpoint |
| `src/app/api/v1/files/download/route.ts` | File download API endpoint (signed URL generation) |

### Database Changes
None — file metadata is stored in Supabase Storage, not in a separate table.

### API Changes
- `POST /api/v1/files/upload` — multipart file upload to Supabase Storage
- `GET /api/v1/files/download/:id` — signed URL generation for secure download

### UI Changes
- Task detail drawer can attach files
- File attachments display in task detail

### Security Changes
- File uploads require authentication
- MIME type whitelist enforced (already implemented in FileService)
- File size limit enforced (already 10MB)
- Signed URLs for secure downloads (time-limited access)

### Estimated Complexity
**Medium** — Supabase Storage SDK integration, signed URL generation

### Estimated Implementation Time
2 days

### Expected Production Impact
Users can upload and download files attached to tasks. File storage is secure and access-controlled.

### Risks
- Storage costs may increase with large files
- Virus scanning not implemented for uploaded files
- Storage bucket may need configuration in Supabase dashboard

### Dependencies
- Phase 2 (database exists)
- Phase 3 (auth resolution works)
- Phase 4 (API security)

### Validation Checklist
- [ ] File upload creates file in Supabase Storage bucket
- [ ] File download returns signed URL
- [ ] MIME type whitelist blocks executable uploads
- [ ] File size limit enforced (10MB)
- [ ] Unauthenticated upload returns 401

### Definition of Done
- FileService uses real Supabase Storage
- File upload/download API endpoints work
- Files are accessible only via signed URLs
- MIME type and size validation enforced

---

## PHASE 10 — Performance Optimization

### Objective
Convert client-only pages to Server Components, add caching, implement code splitting, add Suspense boundaries, and optimize the rendering strategy.

### Why This Phase Comes Now
All functional features are now complete (Phases 1-9). Performance optimization should happen after features are stable, not before — otherwise optimized code gets rewritten as features change.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| D1 | No Server Components — all 22 pages are `'use client'` | HIGH |
| §4.2 | All data fetching via `useEffect` — waterfall pattern | HIGH |
| §4.3 | No `React.lazy()`, no `dynamic()`, no Suspense boundaries | HIGH |
| §4.4 | No bundle size optimization | MEDIUM |
| §4.5 | No caching strategy — no `revalidatePath`, `revalidateTag`, `React.cache` | MEDIUM |
| H16 | `cn` import at bottom of file (3 files) | LOW |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/app/app/dashboard/page.tsx` | Convert to Server Component with Suspense boundary; data fetching via server |
| `src/app/app/tasks/page.tsx` | Decompose into 8-10 focused components; server-side data fetching; client islands for interactivity |
| `src/app/app/goals/page.tsx` | Convert data fetching to server-side; add Suspense |
| `src/app/app/projects/page.tsx` | Same pattern |
| `src/app/app/ai-assistant/page.tsx` | Keep as client (needs WebSocket) but add `dynamic()` import |
| `src/app/app/notifications/page.tsx` | Convert to Server Component with Suspense |
| `src/app/app/billing/page.tsx` | Convert to Server Component with Suspense |
| `src/app/app/organizations/page.tsx` | Convert to Server Component with Suspense |
| `src/app/app/settings/page.tsx` | Convert to Server Component for data; client island for form |
| `src/app/app/admin/page.tsx` | Convert to Server Component with Suspense |
| `src/app/app/calendar/page.tsx` | Convert to Server Component with Suspense |
| `src/app/app/billing/page.tsx` | Move `cn` import to top |
| `src/app/app/organizations/page.tsx` | Move `cn` import to top |
| `src/app/app/feedback/page.tsx` | Move `cn` import to top |
| `next.config.ts` | Add bundle analyzer, image optimization, headers config |

### New Files Created
| File | Purpose |
|------|---------|
| `src/app/app/tasks/components/task-list.tsx` | Extracted task list component (client) |
| `src/app/app/tasks/components/task-kanban.tsx` | Extracted kanban view (client) |
| `src/app/app/tasks/components/task-detail-drawer.tsx` | Extracted detail drawer (client) |
| `src/app/app/tasks/components/task-create-modal.tsx` | Extracted create modal (client) |
| `src/app/app/tasks/components/task-filters.tsx` | Extracted filter bar (client) |
| `src/app/app/tasks/components/task-ai-panel.tsx` | Extracted AI intelligence panel (client) |
| `src/app/app/tasks/components/task-checklist.tsx` | Extracted checklist (client) |
| `src/app/app/tasks/components/task-comments.tsx` | Extracted comments (client) |
| `src/shared/components/ui/suspense-boundary.tsx` | Reusable Suspense boundary with skeleton fallback |

### Database Changes
None.

### API Changes
None.

### UI Changes
- Pages render server-side HTML (SEO, faster initial load)
- Loading skeletons appear during data streaming (Suspense)
- Code splitting reduces initial bundle size
- Calendar page gets real data from services

### Security Changes
None.

### Estimated Complexity
**High** — Converting 22 client components to Server Components requires careful decomposition; task page (1002 lines) is a major refactor

### Estimated Implementation Time
5 days

### Expected Production Impact
Significantly faster initial page loads. Better SEO. Reduced client-side JavaScript. Improved Core Web Vitals.

### Risks
- Server Component conversion may break existing client-side interactivity
- Hydration mismatches between server and client rendering
- Task page decomposition is a major refactor — regression risk
- Some pages (AI Assistant) must remain client-side

### Dependencies
- Phase 3 (auth resolution works)
- Phase 5 (AI streaming works)
- Phase 6 (realtime subscriptions work)
- All previous phases (features are stable before optimization)

### Validation Checklist
- [ ] Server Components render HTML on the server
- [ ] Suspense boundaries show skeleton fallbacks during loading
- [ ] `next build` shows code splitting in output
- [ ] Initial page load time reduced by ≥ 30%
- [ ] Lighthouse score improves for Performance
- [ ] No hydration mismatch errors in console
- [ ] Task page decomposed into ≤ 8 focused components
- [ ] `cn` imports at top of file in all 3 files

### Definition of Done
- All pages use Server Components where possible
- Client components are used only for interactivity
- Suspense boundaries with skeleton fallbacks on all pages
- Code splitting via `dynamic()` for heavy components
- Task page decomposed from 1002-line God Component
- Bundle size reduced and measured

---

## PHASE 11 — Testing Infrastructure

### Objective
Install a test framework, configure coverage, write tests for all critical paths, and establish a testing culture.

### Why This Phase Comes Now
Testing should be done after features are stable (Phases 1-9) and optimized (Phase 10). Writing tests before features are finalized leads to wasted effort on test maintenance. However, testing is critical before production deployment.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| §7.1 | No test framework — no Vitest, Jest, or Playwright in `package.json` | HIGH |
| §7.2 | 13 test scripts are standalone `npx tsx` runners, not automated tests | HIGH |
| §7.3 | Zero test coverage — no coverage tooling | HIGH |
| §7.4 | Critical untested code: auth flow, API routes, state machine, RLS, security, AI, sync | HIGH |

### Exact Files Modified
| File | Change |
|------|--------|
| `package.json` | Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `@vitejs/plugin-react` |
| `tsconfig.json` | Add Vitest types |
| `src/core/types/task-types.ts` | No changes needed — types already well-defined |

### New Files Created
| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration with coverage thresholds |
| `src/tests/setup.ts` | Test setup with mocks for Supabase, Auth, etc. |
| `src/tests/unit/task-state-machine.test.ts` | Task state machine transition tests |
| `src/tests/unit/security-utils.test.ts` | Security utilities tests (XSS, rate limiting, CSRF) |
| `src/tests/unit/ai-service.test.ts` | AI service prompt safety tests |
| `src/tests/unit/ai-gateway.test.ts` | AI gateway provider switching tests |
| `src/tests/unit/permission-manager.test.ts` | Permission matrix tests |
| `src/tests/unit/role-guard.test.ts` | Role guard enforcement tests |
| `src/tests/unit/audit-logger.test.ts` | Audit logger tests |
| `src/tests/unit/event-bus.test.ts` | Event bus pub/sub tests |
| `src/tests/unit/sync-manager.test.ts` | Offline sync manager tests |
| `src/tests/unit/ai-cost-dashboard.test.ts` | Cost quota enforcement tests |
| `src/tests/integration/api-tasks.test.ts` | Tasks API route integration tests |
| `src/tests/integration/api-auth.test.ts` | Auth API route integration tests |
| `src/tests/integration/api-billing.test.ts` | Billing API route integration tests |
| `src/tests/integration/conversation-repository.test.ts` | Conversation repository tests |
| `src/tests/e2e/auth-flow.spec.ts` | Playwright E2E test for login → onboarding → dashboard |
| `src/tests/e2e/task-crud.spec.ts` | Playwright E2E test for task lifecycle |
| `playwright.config.ts` | Playwright configuration |

### Database Changes
None.

### API Changes
None.

### UI Changes
None.

### Security Changes
None.

### Estimated Complexity
**High** — Establishing test infrastructure from scratch; writing tests for complex systems

### Estimated Implementation Time
5 days

### Expected Production Impact
Confidence in correctness. Regression prevention. Coverage metrics for quality gates.

### Risks
- Mocking Supabase client may be complex
- E2E tests may be flaky without proper test environment
- Test maintenance may slow down development

### Dependencies
- All previous phases (features must be stable before writing tests)

### Validation Checklist
- [ ] `npm test` runs all unit tests
- [ ] `npm run test:e2e` runs all E2E tests
- [ ] Coverage threshold ≥ 60% for critical paths
- [ ] Task state machine: all 6 states × allowed transitions tested
- [ ] Security utilities: XSS, rate limiting, CSRF tested
- [ ] AI prompt safety: injection detection tested
- [ ] API routes: auth, validation, rate limiting tested
- [ ] E2E: login → onboarding → dashboard flow works
- [ ] E2E: task CRUD lifecycle works

### Definition of Done
- Vitest configured with coverage thresholds
- Unit tests for all critical paths (state machine, security, AI, permissions)
- Integration tests for all API routes
- E2E tests for critical user flows
- Coverage ≥ 60% for `src/core/` and `src/features/`
- All tests pass in CI

---

## PHASE 12 — CI/CD & DevOps

### Objective
Set up GitHub Actions CI/CD, Docker containerization, and deployment automation.

### Why This Phase Comes Now
Phase 11 established the test suite. CI/CD must run the tests on every commit. Containerization ensures reproducible deployments.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| F1 | No CI/CD — `.github/workflows/` is in `.gitignore` line 42 | HIGH |
| §6.3 | No Docker — no `Dockerfile`, no `docker-compose.yml` | MEDIUM |
| §6.4 | Vercel deployment not configured — empty `next.config.ts` | LOW |

### Exact Files Modified
| File | Change |
|------|--------|
| `.gitignore` | Remove `/.github/workflows/` line 42 |
| `next.config.ts` | Add production configuration (headers, redirects, image optimization) |

### New Files Created
| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI pipeline: lint → type check → test → build |
| `.github/workflows/deploy-preview.yml` | Preview deployment on PR |
| `.github/workflows/deploy-production.yml` | Production deployment on main merge |
| `Dockerfile` | Multi-stage Docker build for Next.js |
| `docker-compose.yml` | Local development environment with PostgreSQL |
| `.dockerignore` | Docker ignore file |
| `vercel.json` | Vercel deployment configuration (if using Vercel) |

### Database Changes
None.

### API Changes
None.

### UI Changes
None.

### Security Changes
- CI pipeline runs security checks (dependency audit, secret scanning)
- Docker image uses non-root user
- Production build is optimized and hardened

### Estimated Complexity
**Medium** — Standard CI/CD setup with GitHub Actions

### Estimated Implementation Time
3 days

### Expected Production Impact
Automated quality gates on every commit. Reproducible builds. Automated deployment pipeline.

### Risks
- CI may be slow if not properly optimized
- Docker image size may be large for Next.js
- Vercel deployment may have environment-specific issues

### Dependencies
- Phase 11 (tests exist for CI to run)

### Validation Checklist
- [ ] CI pipeline runs on every push
- [ ] CI pipeline runs lint, type check, tests, build
- [ ] PR cannot be merged if CI fails
- [ ] Docker build succeeds
- [ ] `docker-compose up` starts local development environment
- [ ] Preview deployment works on PR
- [ ] Production deployment works on main merge

### Definition of Done
- GitHub Actions CI/CD pipeline is active
- All PRs require passing CI
- Docker build is reproducible
- Deployment is automated
- `.github/workflows/` is no longer in `.gitignore`

---

## PHASE 13 — Observability & Monitoring

### Objective
Implement production-grade monitoring, logging, alerting, and distributed tracing.

### Why This Phase Comes Now
Phase 12 set up CI/CD. Before production launch, the system must have observability to detect and diagnose issues.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| §6.5 | `PerformanceMonitor` only logs to console | MEDIUM |
| §6.6 | `Logger` only logs to console; no structured log aggregation | MEDIUM |
| §6.7 | No disaster recovery plan | HIGH |
| §9.9 | No background jobs | MEDIUM |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/core/monitoring/error-tracker.ts` | Wire Sentry integration (currently commented out at line 15) |
| `src/core/monitoring/performance-monitor.ts` | Add real metric reporting (Vercel Analytics or custom) |
| `src/core/logging/logger.ts` | Add structured logging with log levels for production |

### New Files Created
| File | Purpose |
|------|---------|
| `src/core/monitoring/sentry.ts` | Sentry initialization and configuration |
| `src/core/monitoring/analytics.ts` | Production analytics tracking |
| `src/app/api/v1/cron/daily-quota-reset/route.ts` | Cron endpoint for daily AI quota resets |
| `docs/disaster-recovery.md` | Update existing disaster recovery plan with actual procedures |

### Database Changes
None.

### API Changes
- `POST /api/v1/cron/daily-quota-reset` — cron endpoint for daily quota resets (requires cron secret)

### UI Changes
None.

### Security Changes
- Sentry DSN stored in environment variable
- Cron endpoints require secret token authentication
- Error tracking does not include PII

### Estimated Complexity
**Medium** — Standard observability integration

### Estimated Implementation Time
3 days

### Expected Production Impact
Production issues are detected and diagnosed quickly. Alerts fire on errors. Performance metrics are tracked. Daily quotas reset automatically.

### Risks
- Sentry may add latency if not properly configured
- Error tracking may capture sensitive data if not filtered
- Cron endpoints may be abused if not properly secured

### Dependencies
- Phase 12 (CI/CD for deployment)

### Validation Checklist
- [ ] Sentry captures unhandled errors
- [ ] Performance metrics are tracked in production
- [ ] Logs are structured and searchable
- [ ] Cron endpoint resets daily AI quotas
- [ ] Disaster recovery plan is documented
- [ ] Alerting is configured for critical errors

### Definition of Done
- Sentry captures errors in production
- Performance metrics are tracked
- Logs are structured and aggregated
- Cron endpoints work for daily quota resets
- Disaster recovery plan is documented

---

## PHASE 14 — Enterprise SaaS Completion

### Objective
Complete all remaining SaaS features: wire Organizations page to real data, clean up dead code, add optimistic locking, and ensure all features are fully functional.

### Why This Phase Comes Now
All critical infrastructure is in place. This phase completes the remaining SaaS features and cleans up technical debt.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| H11 | Organizations page hardcoded — `src/app/app/organizations/page.tsx` lines 27-30 | MEDIUM |
| H3 | `SupabaseBillingRepository` dead code | LOW |
| H4 | `SupabaseNotificationRepository` dead code | LOW |
| H5 | `SupabaseAIMemoryRepository` dead code | LOW |
| H6 | `SupabaseOrganizationRepository` dead code | LOW |
| H7 | `StripeProductionAdapter` dead code | LOW |
| H8 | `SupabaseAnalyticsRepository` dead code | LOW |
| §2.7 | No optimistic locking | MEDIUM |
| §2.8 | No transactions for multi-step operations | MEDIUM |
| §9.1 | Application-level tenant context missing | MEDIUM |
| B7 | Feature flags RLS permissive | LOW |

### Exact Files Modified
| File | Change |
|------|--------|
| `src/app/app/organizations/page.tsx` | Replace hardcoded orgs with OrganizationService calls; add real CRUD |
| `src/features/analytics/analytics-service.ts` | Replace hardcoded `new MockAnalyticsRepository()` with DI-based resolution |
| `src/core/config/dependency-injector.ts` | Add `getAnalyticsRepository()`, `getNotificationRepository()`, `getBillingRepository()`, `getAIMemoryRepository()`, `getOrganizationRepository()` |
| `src/features/billing/subscription-service.ts` | Replace in-memory Map with SupabaseBillingRepository via DI |
| `prisma/schema.prisma` | Add `version` field to Task, Goal, Project models for optimistic locking |

### New Files Created
| File | Purpose |
|------|---------|
| `prisma/migrations/YYYYMMDD_add_optimistic_locking/migration.sql` | Add `version` column to tasks, goals, projects |
| `src/core/utils/optimistic-lock.ts` | Optimistic locking utility for concurrent update detection |

### Database Changes
- Add `version` INT DEFAULT 1 column to `tasks`, `goals`, `projects` tables
- Add constraint: `CHECK (version >= 1)`

### API Changes
- Update endpoints check version before applying updates; return 409 Conflict on version mismatch

### UI Changes
- Organizations page shows real data from database
- Organizations page supports create, switch, delete operations
- Conflict resolution UI for optimistic locking failures

### Security Changes
- Feature flags RLS tightened to admin-only for non-SELECT operations

### Estimated Complexity
**Medium** — Wiring existing services to real data; adding optimistic locking

### Estimated Implementation Time
4 days

### Expected Production Impact
All pages are data-driven. No dead code. Concurrent update protection. Full SaaS feature set.

### Risks
- Optimistic locking may cause user confusion if not properly communicated
- Organization switching may require full page reload
- Dead code removal may break test files that import them

### Dependencies
- Phase 2 (all tables exist)
- Phase 3 (auth resolution works)
- Phase 5 (AI memory wired)
- Phase 7 (billing wired)
- Phase 8 (notifications wired)

### Validation Checklist
- [ ] Organizations page shows real data from database
- [ ] All Supabase repositories are wired via DI (zero dead code)
- [ ] `AnalyticsService` uses DI-based repository resolution
- [ ] Optimistic locking prevents silent overwrites
- [ ] Version conflict returns 409 with clear error message
- [ ] Feature flags RLS restricts non-SELECT to admin

### Definition of Done
- All pages are data-driven (zero hardcoded data)
- All Supabase repositories are wired via DI
- No dead code in `src/features/` and `src/core/`
- Optimistic locking works on tasks, goals, projects
- Organization switching works

---

## PHASE 15 — Production Readiness Validation

### Objective
Final validation of the entire system against production readiness criteria. No new features — only verification, documentation, and final adjustments.

### Why This Phase Comes Now
All features are implemented, tested, and optimized. This is the final gate before production launch.

### Verified Findings Resolved
| ID | Finding | Severity |
|----|---------|----------|
| All | Final validation of all 35 findings | — |

### Exact Files Modified
| File | Change |
|------|--------|
| `docs/production-runbook.md` | Update with actual procedures |
| `docs/production-launch-checklist.md` | Update with actual checklist |
| `README.md` | Update with production deployment instructions |

### New Files Created
| File | Purpose |
|------|---------|
| `docs/production-verification-report.md` | Final production readiness verification report |

### Database Changes
None.

### API Changes
None.

### UI Changes
None.

### Security Changes
- Final security scan
- Dependency audit
- Secret scanning

### Estimated Complexity
**Low** — Verification and documentation only

### Estimated Implementation Time
2 days

### Expected Production Impact
Confidence that the system is production-ready. Documentation for operations team.

### Risks
- Final verification may reveal issues requiring fixes
- Production environment may differ from staging

### Dependencies
- All previous phases

### Validation Checklist
- [ ] All 35 findings resolved and verified
- [ ] Security scan shows no critical/high vulnerabilities
- [ ] All tests pass in CI
- [ ] All API routes return correct responses
- [ ] RLS policies are enforced
- [ ] Performance metrics meet targets
- [ ] Monitoring and alerting are active
- [ ] Disaster recovery plan is documented
- [ ] Production runbook is complete
- [ ] Deployment checklist is complete

### Definition of Done
- All 35 verified findings are resolved
- Production readiness score ≥ 80/100
- All tests pass
- Security scan is clean
- Documentation is complete
- System is ready for production launch

---

## DEPENDENCY GRAPH

```
Phase 1 (Security Emergency)
  ↓
Phase 2 (Database Completion)
  ↓
Phase 3 (Auth Hardening) ← depends on Phase 1, 2
  ↓
Phase 4 (API Hardening) ← depends on Phase 1, 2, 3
  ↓
Phase 5 (AI Infrastructure) ← depends on Phase 2, 3, 4
  ↓
Phase 6 (Realtime) ← depends on Phase 2, 3, 5
  ↓
Phase 7 (Billing) ← depends on Phase 2, 3, 4
  ↓
Phase 8 (Notifications & Audit) ← depends on Phase 2, 6
  ↓
Phase 9 (File Storage) ← depends on Phase 2, 3, 4
  ↓
Phase 10 (Performance) ← depends on all Phases 1-9
  ↓
Phase 11 (Testing) ← depends on all Phases 1-9
  ↓
Phase 12 (CI/CD) ← depends on Phase 11
  ↓
Phase 13 (Observability) ← depends on Phase 12
  ↓
Phase 14 (Enterprise SaaS Completion) ← depends on Phases 5, 7, 8
  ↓
Phase 15 (Production Validation) ← depends on all Phases
```

**Note:** Phases 6, 7, 8, 9 can run in parallel after Phase 4 (they are independent of each other). Phases 10 and 11 can run in parallel after Phase 9.

---

## EFFORT SUMMARY

| Phase | Days | Parallelizable? |
|-------|------|-----------------|
| 1. Security Emergency | 3 | No — first |
| 2. Database Completion | 4 | No — depends on Phase 1 |
| 3. Auth Hardening | 3 | No — depends on Phase 2 |
| 4. API Hardening | 3 | No — depends on Phase 3 |
| 5. AI Infrastructure | 5 | No — depends on Phase 4 |
| 6. Realtime | 4 | Yes — parallel with 7, 8, 9 |
| 7. Billing | 5 | Yes — parallel with 6, 8, 9 |
| 8. Notifications & Audit | 3 | Yes — parallel with 6, 7, 9 |
| 9. File Storage | 2 | Yes — parallel with 6, 7, 8 |
| 10. Performance | 5 | Yes — parallel with 11 |
| 11. Testing | 5 | Yes — parallel with 10 |
| 12. CI/CD | 3 | No — depends on Phase 11 |
| 13. Observability | 3 | No — depends on Phase 12 |
| 14. Enterprise SaaS | 4 | No — depends on Phases 5, 7, 8 |
| 15. Production Validation | 2 | No — final |

**Sequential Path:** 1→2→3→4→5 = 18 days  
**Parallel Path (6,7,8,9):** max(4,5,3,2) = 5 days  
**Parallel Path (10,11):** max(5,5) = 5 days  
**Sequential Path:** 12→13 = 6 days  
**Phase 14:** 4 days  
**Phase 15:** 2 days  

**Total Critical Path:** 18 + 5 + 5 + 6 + 4 + 2 = **40 days (≈ 8 weeks)**  
**With 2 Engineers:** ≈ **6 weeks**  
**With 3 Engineers:** ≈ **5 weeks**

---

## SUCCESS CRITERIA

| Metric | Target | Measurement |
|--------|--------|-------------|
| Security Score | ≥ 80/100 | Zero CRITICAL/HIGH findings |
| Production Readiness | ≥ 80/100 | All deployment blockers resolved |
| Test Coverage | ≥ 60% | Vitest coverage for `src/core/` and `src/features/` |
| API Authentication | 100% | All routes require auth (except health) |
| Database Tables | 14/14 | All Prisma models have corresponding tables |
| RLS Coverage | 100% | All tables have RLS enabled with policies |
| Dead Code | 0 | No unused Supabase repositories |
| Hardcoded Data | 0 | No hardcoded userId, orgId, or credentials |
| CI/CD | Active | All PRs require passing CI |
| Performance | ≥ 30% improvement | Initial page load time reduction |

---

*End of Enterprise Execution Roadmap. This document is the official implementation plan for transforming Cortex AI into a production-ready SaaS system.*
