# 16. Production Backend Integration & Adapter Architecture

**Author:** Principal Software Architect & Lead Cloud Engineer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Relational Database & ORM Mapping

Cortex AI implements a dual-tier data access strategy to bridge compile-time safety with cloud-native PostgreSQL performance:

```
                    COMPILE STAGE (Prisma CLI)
                    [ schema.prisma Definition ]
                                 │
                                 ▼ (npx prisma migrate dev)
                    [ Staging & Production DDL ]
                                 │
                                 ▼
                     RUNTIME STAGE (SaaS Engine)
                     [ ITaskRepository Interface ]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
       [ MockTaskRepository ]      [ SupabaseTaskRepository ]
         (In-Memory Local)            (Direct PostgREST client)
```

- **Database Schemas:** Managed and version-controlled via **Prisma ORM** (`schema.prisma`). All table models, field bindings, and indexing indices are applied via Prisma Migrations automatically.
- **SaaS Operations (CRUD):** Executed via the `@supabase/supabase-js` standard client. This connects to PostgREST, enabling seamless support for **Row Level Security (RLS)**, automated session authentication, and direct browser-to-database communication.

---

## 2. Abstraction Decoupling: The Repository Pattern

To ensure the Domain and Service layers remain completely independent of the selected data provider, we enforce the **Repository Pattern**:

- **Contract (`src/features/tasks/repositories/task-repository-interface.ts`):** Defines the standard signatures (`getTasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`).
- **Development Mock (`MockTaskRepository`):** Emulates database operations in-memory, seeding typical user, project, and tasks data for isolated local development and E2E testing without external databases dependencies.
- **Supabase Production (`SupabaseTaskRepository`):** Executes queries directly on PostgreSQL through the cookie-bound Supabase Client, mapping the database `snake_case` columns back into standard camelCase domain entities.
- **Runtime Swapping:** The feature Service (`TaskService`) holds a static instance `repository: ITaskRepository` initialized to the Mock repository. When moving to staging/production, calling `TaskService.setRepository(new SupabaseTaskRepository())` switches the data source instantly across the entire platform, requiring **zero code modification** inside our Next.js pages or React components!
