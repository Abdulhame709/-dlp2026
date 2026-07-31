# 02. Architecture & System Design

## 1. Architectural Decisions: Prisma + Supabase Integration Strategy
One of the most critical architectural decisions for Cortex AI is how to safely and cleanly integrate **Prisma ORM** with **Supabase**.

### The Architect's Decision: Option 2 (Supabase Client for Queries + Prisma for Schema/Migrations Only)
We will strictly employ **Option 2** as our architectural approach.

```
                  DEVELOPMENT STAGE
             [ schema.prisma Definition ]
                         │
                         ▼ (prisma migrate dev)
             [ PostgreSQL Schema Deployment ]
                         │
                         ▼
                  PRODUCTION RUNTIME
  ┌──────────────────────────────────────────────┐
  │                                              │
  ▼ (Client / Server Queries)                    ▼ (Realtime / Storage listeners)
[ Supabase JS Client ]                    [ Postgres RLS Policies ]
```

#### Why we made this decision:
1. **Row Level Security (RLS) Native Integration:** Supabase relies on PostgreSQL native RLS. When a user requests data via the `Supabase Client`, the client attaches the user's JSON Web Token (JWT). PostgreSQL inspects the token and securely filters the records at the engine level. 
2. **Prisma Bypass Risk:** Prisma connects to PostgreSQL via a direct database connection pool using superuser or direct connection strings. If we query the database using standard Prisma models on the server, Prisma completely bypasses Supabase RLS. Enforcing RLS with Prisma requires executing complex raw transaction queries (`SET LOCAL request.jwt.claim...`) before every request, which introduces major performance and development overhead.
3. **Realtime & Storage Capabilities:** Supabase's Realtime and Storage clients require native Supabase integration. Using the standard Supabase Client guarantees consistent access to file assets and instant WebSocket pushes.
4. **Prisma is the Ultimate Schema & Migration Manager:** While Supabase Client handles runtime operations, writing migration SQL files manually is error-prone. Prisma provides the absolute best-in-class declarative schema language, database diffing, and version-controlled migration pipelines (`prisma migrate`).

#### Implementation Protocol:
- **Database Schema & Migrations:** Written in `schema.prisma`. Deployed via `npx prisma migrate dev` in development and automatically in production pipelines.
- **Application CRUD & Logic:** Executed using the `@supabase/supabase-js` client (both on Next.js Client Components and Server-Side Actions/Endpoints).
- **Type Safety:** We will generate Supabase TypeScript definitions directly from our database schema after Prisma migrations using the Supabase CLI, ensuring 100% compile-time safety.

---

## 2. Multi-Tenant Isolation Model
Cortex AI's multi-tenancy model ensures clean separation and prevents horizontal data leakage.

```
       [ Individual User ]               [ Organization / Enterprise ]
                │                                      │
                ▼                                      ▼
       [ Personal Profile ]               [ Org Owner / Admins / Members ]
                │                                      │
                ├──────────────────────────────────────┤
                ▼                                      ▼
        [ Default Workspace ]                 [ Team Workspaces ]
                │                                      │
                ▼                                      ▼
         [ Goal Entity ]                       [ Project Entity ]
                │                                      │
                └───────────────────┬──────────────────┘
                                    ▼
                              [ Task Entity ]
```

- **Tenancy ID (`organization_id`):** Every tenant-owned entity (`projects`, `tasks`, `milestones`, `goals`) has a nullable/required `organization_id` column.
- **RLS Enforced Access:** Supabase RLS policies check the user's membership in `organization_members`. If a user is not an active member of that Organization, the database rejects the query before any data is returned to the Next.js runtime.

---

## 3. Dynamic Feature Flag Architecture (نظام التحكم في الميزات)
To decouple code deployments from feature releases, and easily manage transitions between the MVP, Pro, and Enterprise tiers, a **Feature Flag System** is integrated into the core architecture:

### Conceptual Flow:
```
[ User Request ] ➔ [ Middleware / Feature Check ] ➔ [ Is Flag Enabled? ]
                                                            │
                                              ┌─────────────┴─────────────┐
                                              ▼ (Yes)                     ▼ (No)
                                      [ Render Feature ]          [ Render Fallback /
                                                                    Upgrade Screen ]
```

### Supported Flags:
- `feature_ai_planner`: Enables advanced schedule optimization and automatic calendar time blocking.
- `feature_teams`: Enables team invites, organization views, and shared projects.
- `feature_payments`: Enables billing triggers, limit checks, and subscription upgrade gateways.
- `feature_knowledge_rag`: Enables vector-backed notes summary and custom knowledge RAG.

### Implementation:
Flags are defined in an configuration file for local development (`config/feature-flags.ts`) and backed by an administrative database table (`feature_flags`) for production, allowing dynamic real-time toggling from the Admin Dashboard without rebuilds.
