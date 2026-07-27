# 26. Error Tracking, Auditing & Monitoring SRE Architecture

**Author:** Site Reliability Engineer (SRE) & Lead DevSecOps  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. SRE Observability Architecture

Cortex AI implements a non-intrusive, production-ready observability architecture (`src/core/monitoring/`):

- **Error Tracker (`src/core/monitoring/error-tracker.ts`):** Formats uncaught rendering and API boundary exceptions, logging structured JSON telemetry strings to standard console streams. This architecture is fully prepared for instant Sentry initialization.
- **Performance Monitor (`src/core/monitoring/performance-monitor.ts`):** Benchmarks API response latencies and database queries to track sub-second performance budgets.
- **Audit Logger (`src/core/monitoring/audit-logger.ts`):** Persists sensitive, administrative mutations (password modifications, soft-delete commands) directly to the PostgreSQL `audit_logs` table for compliance auditing.
