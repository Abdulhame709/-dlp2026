# Cortex AI - Platform Administrator Guide

**Author:** SRE & System Operations Team  
**Version:** v1.0  
**Target:** System & Organization Administrators  

---

## 1. Entering the Admin Console
System administrators can access the centralized platform telemetry dashboard at `https://cortexai.com/app/admin`:
- **Statistics Row:** Traces real-time active users counts, active organizations, AI request rates, and system uptime metrics.
- **AI Quotas Tracker:** Traces monthly token allocations and active budget balances.
- **SRE Audit Logs:** Reviews sensitive security events (failed logins, role modifications, billing changes).

---

## 2. Managing Organization Members & Roles

As an Organization Owner or Admin:
1. Navigate to Organization settings.
2. **Invite Members:** Input their email and assign an authorized role (`ADMIN` or `MEMBER`). This dispatches secure invitations.
3. **Roles Management:** Update a member's role dynamically. Only the Organization OWNER has access to promote standard members to ADMINISTRATORS or modify billing parameters.
4. **Member Removal:** Revoke organization membership instantly to preserve data confidentiality.
