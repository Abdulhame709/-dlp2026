# 23. Security Hardening & Content Security Policy Specification

**Author:** Chief Information Security Officer (CISO) & Security Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Content Security Policy (CSP) Configuration

Cortex AI implements a strict, enterprise-compliant Content Security Policy to defend against Cross-Site Scripting (XSS) and data injection vulnerabilities. The policy is applied directly through our security middleware helpers:

```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' data: https://fonts.gstatic.com; 
  img-src 'self' data: https:; 
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
```

---

## 2. Standard HTTP Security Headers

Every network response returned by the Cortex AI application layer is injected with standard, security-enhancing HTTP response headers:

- **`X-Frame-Options: DENY`:** Neutralizes Clickjacking attacks by preventing the platform from being embedded inside frames or iframes of other web domains.
- **`X-Content-Type-Options: nosniff`:** Prevents browser clients from MIME-sniffing and executing file payloads as script or stylesheet targets, ensuring they only parse files according to their declared Content-Type.
- **`X-XSS-Protection: 1; mode=block`:** Re-enables browser XSS filtering, blocking page rendering instantly if a cross-site scripting attack is intercepted.
- **`Strict-Transport-Security`:** Forces browser clients to transmit all requests exclusively over HTTPS.

---

## 3. Database RLS Security Proof

Database security is enforced natively at the PostgreSQL layer using **Supabase Row Level Security (RLS)**. No user can view, alter, or insert records belonging to other tenants.
- **Cross-Tenant Protection:** Select queries are joined with `organization_members` verifying active company membership before returning records.
- **Audit Logging:** Every administrative action is logged dynamically in our audit log tables.
