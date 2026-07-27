# Cortex AI - SRE Disaster Recovery & Backup Plan

**Author:** SRE Lead & Lead DevOps Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 🛡️ Backup & Point-In-Time-Recovery (PITR)

To protect multi-tenant personal, task, and project data against accidental loss or regional network infrastructure failures, Cortex AI commits to the following SRE standards:

- **Continuous WAL Archiving:** Write-Ahead Logs (WAL) are streamed continuously to redundant cloud object storage (Amazon S3 / Supabase Backups Tiers) supporting physical point-in-time database restoration.
- **Daily Physical Backups:** Full compressed transactional database snapshots are executed automatically every 24 hours at `02:00 UTC` (lowest traffic period) and stored with standard AES-256 physical encryption.
- **RPO (Recovery Point Objective):** **1 Hour** (maximum of 60 minutes of potential data modifications loss).
- **RTO (Recovery Time Objective):** **15 Minutes** (maximum duration to restore full operational status).

---

## 🔄 Emergency Restore Procedure Playbook

If a major database cluster crash or regional infrastructure blackout occurs, the SRE team executes the following recovery steps:

### Step 1: Initialize Cold Standby Postgres Instance
Prepare a cold standby database cluster in an isolated geographic region (e.g., EU Central / US West).

### Step 2: Fetch and Decompress Latest Compressed Snapshot
Fetch the last valid compressed daily backup file and WAL logs from S3:
```bash
aws s3 cp s3://cortex-prod-backups/snapshots/latest-snapshot.tar.gz .
tar -xzf latest-snapshot.tar.gz
```

### Step 3: Stream and Apply Write-Ahead Logs (WAL)
Deploy the snapshot and play back the WAL logs up to the exact point of the crash (minus any corrupt frames) to achieve perfect data restoration:
```bash
pg_restore -d postgresql://postgres.standby-project -h aws-0-eu-central-1.pooler.supabase.com latest-snapshot.sql
```

### Step 4: Swap Application Connection Strings
Update the `DATABASE_URL` environment variables in Vercel to point to the new standby PostgreSQL cluster and trigger an Edge refresh. The complete platform returns to fully-operational status within the 15-minute RTO boundary.
