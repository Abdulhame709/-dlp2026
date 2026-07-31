# 24. SaaS Platform & Organizations Architecture

**Author:** Chief Product Officer & Senior Enterprise Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. SaaS Multi-Tenancy Architecture

Cortex AI implements a robust, secure **Multi-Tenant SaaS architecture** mapped at both database-RLS and application layers:

```
[ User Session Profile ] ➔ [ activeWorkspaceId (Zustand Store) ]
                                      │
                       ┌──────────────┴──────────────┐
                       ▼                             ▼
         [ Individual Settings ]             [ Team Organization ]
           - language / locale                 - Shared Projects
           - timezone formats                  - Roles & Invites
           - AI coaching toggle                - Member permissions
```

- **User Preferences Sync:** Users configure full name, localized language/Arabic Cairo typography, timezone, dark/light theme, and AI behavior preferences in `src/features/settings/`.
- **Hierarchical Isolation:** Users manage shared company projects and teams in `src/features/organizations/`. 

---

## 2. Decoupled Role & Permission Matrix (RBAC)

To support future team collaborations and enterprise setups, authorization is completely decoupled from role names:
- **Roles:** `OWNER`, `ADMIN`, `MEMBER`.
- **Permissions Catalog:** `CREATE_TASK`, `INVITE_MEMBER`, `UPDATE_ORG`, `MANAGE_BILLING`.
- **Enforcement (`src/core/auth/permission-manager.ts`):** Transactions and actions call `await PermissionManager.enforce(organizationId, 'INVITE_MEMBER')` before executing, providing absolute, scalable security.

---

## 3. Global Command Search Index (`Ctrl + K` / `Cmd + K`)
The search engine (`src/core/services/global-search-service.ts`) compiles indices across multiple active sub-systems in real time:
- Scans `tasks` and `conversations` dynamically using standard text index searches, returning standard, mapped `GlobalSearchResult` array.
