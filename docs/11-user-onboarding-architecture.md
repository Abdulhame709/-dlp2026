# 11. User Onboarding & Workspace Wizard Architecture

**Author:** Principal Solutions Architect & Senior Product Manager  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Onboarding Flow & Gate Architecture

Cortex AI implements a **strict onboarding gate**. Even if a user has registered and verified their email address, they are prevented from accessing any functional parts of the system (dashboard, tasks, calendar, projects) until they complete their onboarding profile and initialize a workspace.

```
       [ Register User ] ➔ [ Verify Email ] ➔ [ Login ]
                                                 │
                                                 ▼ (Middleware Intercepts)
                                       [ Is Onboarding Done? ]
                                                 │
                                    ┌────────────┴────────────┐
                                    ▼ (No)                    ▼ (Yes)
                           [ Force Redirect to ]       [ Allow Access to ]
                           [  /app/onboarding  ]       [  /app/dashboard ]
```

---

## 2. Onboarding Steps Breakdown

### Step 1: User Profile Setup
The user configures their identity, region, and visual presentation:
- **Full Name:** Validated via Zod (`min(2)` characters).
- **Avatar:** Link or upload to Supabase Storage profiles folder.
- **Language / Locale:** Options (`ar`, `en`).
- **Timezone:** Options (dynamic lookup, e.g., `Asia/Aden`, `UTC`).
- **Theme:** Choices (`light`, `dark`, `system`).
- **Formats:** Date and Time format preferences (`YYYY-MM-DD`, `HH:mm`).

### Step 2: Workspace Configuration Wizard
Every user belongs to at least one primary **Workspace** which serves as their central tenant database wrapper:
- **Workspace Name:** (e.g., "Abdul's Workspace").
- **Workspace Icon & Color:** Customizable visual brand assets.
- **Workspace Type:**
  - **`PERSONAL`:** Self-contained personal space.
  - **`TEAM`:** Shared workspace with collaborative tasks.
  - **`ORGANIZATION`:** Enterprise-level multi-team isolation.

### Step 3: Organization & Members Initialization
Behind the scenes, the onboarding wizard initializes the corporate hierarchy in PostgreSQL:
- An **`Organization`** container is inserted with the user as `owner_id`.
- An **`OrganizationMember`** is mapped linking the user to the organization with the role `OWNER`.
- The user's metadata inside the Supabase Auth JWT is updated with:
  - `onboarding_completed: true`
  - `default_org_id: <organization_uuid>`

---

## 3. Invitation System Foundation
- **Inviting Coworkers:** Users in `TEAM` or `ORGANIZATION` workspaces can invite team members by inputting their emails and selecting an roles map (`ADMIN` or `MEMBER`).
- **Authorization Verification:** Before sending invitations, the system uses the `RoleGuard` to assert that the sender is an authorized `OWNER` or `ADMIN`. Ordinary members are prevented from triggering invitations.

---

## 4. Telemetry & Analytics Events
Each milestone in the onboarding journey is logged in our centralized activity logging systems:
- `user_onboarding_started`
- `user_profile_configured`
- `workspace_created`
- `onboarding_completed`
