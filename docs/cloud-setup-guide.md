# Cloud Setup & Integration Guide

**Author:** SRE Lead & Lead Cloud Architect  
**Version:** 1.0  
**Date:** July 28, 2026  

---

## 1. Supabase Cloud Configuration Sequence

Follow this manual sequence to initialize your Supabase production project:

### Step 1: Initialize PostgreSQL Database
1. Create a new project on [Supabase Dashboard](https://supabase.com).
2. Set up a secure database password.
3. Retrieve your **Transaction Connection Pooler string** under **Settings ➔ Database** (port `6543`, with `?pgbouncer=true` appended).

### Step 2: Run Database Migrations
Open your terminal inside the cloned repository, export the URL, and run Prisma migrations:
```bash
export DATABASE_URL="postgresql://postgres.your-project-id:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npx prisma migrate deploy
```
*Verification:* Check that the tables have been created successfully.

### Step 3: Create Private Storage Buckets
1. In Supabase Dashboard, navigate to **Storage**.
2. Click **New Bucket**, name it `attachments`, and set privacy to **Private**.
3. Apply active RLS folders access rules.

### Step 4: Activate Realtime Channels
1. Navigate to **Database ➔ Replication**.
2. Enable replication for tables `tasks`, `notifications`, and `ai_conversations`.

---

## 2. Vercel Edge Hosting Deployment Sequence

Follow this sequence to deploy your Next.js 15 application to Vercel:

### Step 1: Connect GitHub Repository
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New... ➔ Project**, select your cloned GitHub repository, and choose `arena/019fa52b-dlp2026` or the merged `main` branch.

### Step 2: Inject Environment Variables
Configure the following secure environment variables in your Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production Supabase anonymous key.
- `DATABASE_URL`: Connection string.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key.
- `OPENAI_API_KEY`: Production OpenAI API Key.
- `USE_MOCK`: Set to `false` to instantly disable mock layers and activate your live sychronized PostgreSQL tables!

### Step 3: Deploy
Click **Deploy**. Vercel will automatically compile the Next.js 15 project and serve it.

---

## 3. SRE Rollback Considerations & Emergency Procedure

If a critical database corruption or build failure occurs during live production updates, execute this emergency rollback playbook:

1. **Revert Vercel Deployments:** Open your Vercel Dashboard, select the previous successful build deployment, and click **Promote to Production** (instantly rolling back client assets in less than 5 seconds!).
2. **Revert Database Schema:** If a database migration was corrupt or caused an index block, connect to the standby replica or restore the database to the previous hourly snapshot (RPO: 1 Hour) as outlined in `docs/disaster-recovery.md`.
3. **Emergency Mock Mode Switch:** Set the environment variable `USE_MOCK=true` inside your Vercel dashboard and click **Redeploy**. This bypasses all active Supabase integrations, returning the entire platform back to the fully operational in-memory Mock databases instantly!
