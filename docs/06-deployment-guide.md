# 06. Cloud Infrastructure & Deployment Guide

## 1. Production Architecture Topology
Cortex AI operates as a cloud-native SaaS application optimized for global performance and latency protection.

```
                  [ USER CLIENT ]
                         │
                         ▼ (Global Edge CDN)
               [ Vercel Edge Hosting ]
                         │
                  [ Next.js App ]
                         │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
[ Supabase PostgreSQL ]          [ OpenAI Engine API ]
  - Storage & Realtime             - Prompt Orchestrator
```

- **Frontend Application Hosting:** **Vercel**
- **Database & Identity Platform:** **Supabase (PostgreSQL)**
- **AI Processing Engines:** **OpenAI API**
- **DNS & CDN Layer:** Cloudflare / Vercel Edge Network

---

## 2. Environment Configurations
We maintain three environment layers to isolate staging features from active production users:

### 2.1 Development (`local`)
- Running locally.
- Uses local Node.js server and localized PostgreSQL/Supabase instances.
- Secrets stored in `.env.local`.

### 2.2 Staging (`staging`)
- Automated deployments from the `develop` branch.
- Hosted on a Vercel staging project and connected to a separate, isolated Supabase staging database.
- Used for pre-release quality assurance and automated E2E testing.

### 2.3 Production (`production`)
- Automated deployments only when code is merged to the `main` branch.
- High-performance, isolated infrastructure tiers with full logging, backups, and encryption active.

---

## 3. Database Migration Deployment Workflow
Manual modification of schemas inside production database tables is strictly prohibited. Schema upgrades must follow this deterministic flow:

```
[ Modify schema.prisma ] ➔ [ npx prisma migrate dev (Local Test) ] ➔ [ Commit Migration Files ]
                                                                             │
                                                                             ▼
[ Deploy to Staging DB ] ◄───────── [ Automated CI/CD Pipeline ] ◄───────────┘
          │
          ▼
[ Run Integration Tests ] ➔ [ Deploy & Apply to Production DB ]
```

- Schema migrations are tracked as SQL files inside the `prisma/migrations` folder and executed automatically during server initialization.

---

## 4. Disaster Recovery & Backup Plan
- **Automatic Backups:** Daily snapshots of the PostgreSQL production database with Point-In-Time-Recovery (PITR) enabled.
- **File Assets:** Redundant geographical replication of Supabase Storage buckets.
- **RPO (Recovery Point Objective):** Maximum 1 hour of potential database changes loss.
- **RTO (Recovery Time Objective):** Maximum 15 minutes of downtime in the event of an infrastructure failure.

---

## 5. Security & SSL Compliance Checklist
Before going live, the deployment pipeline verifies:
- [ ] Strict **HTTPS enforcement** with TLS 1.3 certificates.
- [ ] Active **Row Level Security (RLS)** policies on all target database tables.
- [ ] Proper configuration of CORS headers.
- [ ] HSTS (HTTP Strict Transport Security) enabled.
- [ ] Secure cookies flagged as `HttpOnly`, `Secure`, and `SameSite=Strict`.
