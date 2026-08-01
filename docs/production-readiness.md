# 21. Production Readiness Hardening & SRE Blueprint

**Author:** SRE Team & DevOps Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Production Environments Setup

Cortex AI leverages three isolated cloud environment tiers to prevent unstable mutations from impacting active users:

- **Development Sandbox:** Runs locally, bound to a local PostgreSQL instance or dedicated Supabase local sandbox with standard mock data layer seeded.
- **Staging Environment:** Automated CI/CD deployments connected to isolated Supabase staging projects. Hosts rigorous automated end-to-end integration test suites.
- **Production Environment:** High-performance, geographically redundant servers. Access keys are strictly restricted via secret managers.

---

## 2. Advanced Migration & Seed Management

All schema mutations follow a zero-manual-intervention lifecycle:
- **Prisma Migrations:** DB state changes are recorded as incremental SQL migration files in `prisma/migrations/`.
- **Seeding Pipelines:** Local development features a dedicated seed script (`prisma/seed.ts`) which populates test records. It blocks execution on production endpoints via URL inspections.
- **DB Reset Commands:** Dedicated scripts (`npm run db:reset`) are available for local developers to instantly teardown and rebuild local tables for rapid debugging.

---

## 3. Observability & Telemetry Hardening

To maintain robust monitoring, the platform records structural telemetry across every user transaction:

- **Logging Levels:** Configured with `INFO`, `WARNING`, `ERROR`, `SECURITY` levels outputting structured JSON logs.
- **Audit Trails:** Significant security and state mutations (`user_registered`, `task_completed`, `attachment_uploaded`) are logged both in the server console and persisted inside the `activity_logs` table for compliance tracking.
- **Performance Benchmarks:** Query paths are optimized with indexes to maintain sub-second rendering bounds even with 10,000+ active task records.
