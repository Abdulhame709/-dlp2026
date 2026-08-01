# 10. Authentication & Security Architecture

**Author:** Principal Software Engineer & Chief Security Officer  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Authentication Topology & Flow Diagram
Cortex AI implements a highly secure, cookie-based session model powered by **Supabase Auth** and Next.js Edge Middleware.

```
[ User Client ] ➔ (Sign In Request) ➔ [ Next.js API Route / Server Action ]
                                                   │
                                                   ▼
                                        [ Supabase Auth API ]
                                                   │ (Validates credentials)
                                                   ▼
[ User Client ] ◄── (Secure HTTP Cookies) ◄── [ Server Client ]
```

---

## 2. Session Management & JWT Validation
- **Secure Storage:** JWT tokens (Access token and Refresh token) are stored in secure, `HttpOnly`, `Secure`, and `SameSite=Lax` cookies. This protects them from access via client-side scripts, neutralizing Cross-Site Scripting (XSS) session theft.
- **Session Hydration & Token Rotation:** The Next.js Edge Middleware intercepts all incoming requests to read cookies, updates the user's active session, and automatically writes the rotated, renewed tokens back to the response headers when required.
- **Auto-Logout:** Sessions are configured with a strict expiration window (e.g., 2 hours). If the session expires and the refresh token is invalid or revoked, the middleware immediately intercepts the request and redirects the user to `/login`.

---

## 3. Route Protection & Middleware Routing
The Edge Middleware (`src/middleware.ts`) protects all secure domains of the SaaS web application:

- **Protected Slugs:** `/app/*` (e.g., `/app/dashboard`, `/app/settings`, `/app/tasks`, `/app/goals`, `/app/projects`, `/app/organizations`, `/app/ai`).
- **Middleware Checks:**
  - Invokes `supabase.auth.getUser()` to verify the token signature directly against Supabase.
  - If authenticated user tries to access `/login` or `/register`, they are redirected to `/app/dashboard`.
  - If unauthenticated guest tries to access `/app/...`, they are redirected to `/login` with their original path appended as a redirect query (`/login?redirect=/app/tasks`).

---

## 4. Multi-Tenant Role-Based Access Control (RBAC)
Role-based access check is implemented using our type-safe `RoleGuard` helper at `src/core/auth/role-guard.ts`.
- **Supported Roles:** `OWNER`, `ADMIN`, `MEMBER`.
- **Usage Contexts:**
  - **Server Actions:** Before executing mutations (like adding new members or deleting projects), the action calls `await RoleGuard.enforce(organizationId, ['OWNER', 'ADMIN'])` to abort unauthorized transactions.
  - **REST APIs:** Enforces permissions at the route handler level, returning `403 Forbidden` if validation fails.
  - **React Components:** Local helper checks user context and renders/hides administrative buttons or tabs on the screen.

---

## 5. Standard Security Guardrails & Defense

### 5.1 Brute Force Rate Limiting
Authentication and high-value endpoints are protected against brute force dictionary attacks using an IP-based sliding window rate-limiter at `src/core/security/security-utils.ts` that limits concurrent attempts from a single IP address (e.g., maximum 20 requests per 1-minute window).

### 5.2 XSS (Cross-Site Scripting) Sanitization
All free-text inputs (like task descriptions, profile names, comments) are passed through strict HTML character encoders to neutralize script injections before storage:
`SecurityUtils.sanitizeXSS(input)`

### 5.3 CSRF (Cross-Site Request Forgery) Prevention
All Server Actions and REST API mutation endpoints inspect secure headers (`host`, `origin`, `referer`) to verify request provenance and block malicious, cross-site origin submissions.

### 5.4 SQL Injection Protection
By employing parameterized query wrappers natively inside the Supabase JS Client and type-safe schema queries inside Prisma, SQL injection attempts are completely neutralized.
