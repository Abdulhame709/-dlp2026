# Cortex AI - Production Launch Runbook

**Author:** Site Reliability Engineering (SRE) Lead  
**Document Status:** Approved & Production-Ready  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 🚀 Pre-Launch Environment Setup & Variables

Before executing migrations or enabling user log-ins on Vercel Edge Hosting, verify that all production environment variables are stored inside the secure **Secret Manager** (Vault / Vercel Environment Variables Console):

- `DATABASE_URL`: Set to the direct transaction pool connection string pointing to Supabase PostgreSQL AWS region cluster.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Set to your production Supabase project parameters.
- `SUPABASE_SERVICE_ROLE_KEY`: Keep completely secret. Do not expose to client bundles.
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: Set to active billing production accounts.

---

## 🛠 Step-by-Step Production Release Playbook

Follow these exact steps chronologically during the launch sequence:

### Step 1: Deploy Database Schema & Migrations
Connect to the production database and deploy the version-controlled schema modifications using Prisma CLI:
```bash
npx prisma migrate deploy
```
*Verification:* Check that the table structures are successfully created, and verify that RLS is active on all 14 tables in PostgreSQL.

### Step 2: Seed Default System Prompts & Configurations
Execute the production seeding command to populate initial administrative tables and prompt templates:
```bash
npx prisma db seed
```
*Verification:* Check that `feature_flags` table is populated and verify default system prompts for the Prioritizer and Planner are active.

### Step 3: Configure Storage Buckets Access Policies
Inside Supabase Storage, create the private bucket named `attachments` and set active RLS folders access rules.

### Step 4: Deploy NextJS Codebase to Vercel
Trigger the deployment to Vercel Edge.
```bash
git checkout main
git merge develop
git push origin main
```
*Verification:* Wait for the Vercel Build pipeline to compile successfully, and ensure the edge runtime has completed.
