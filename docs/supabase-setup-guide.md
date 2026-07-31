# Supabase Production & Alpha Setup Guide

**Author:** DevOps Architect & Cloud Security Engineer  
**Version:** 1.0  
**Date:** July 28, 2026  

---

## 1. Supabase Project Initialization

To establish a production-grade Supabase project for Cortex AI (Staging, Private Alpha, or Production), follow these steps:

### Step 1: Create Supabase Project
1. Log in to the [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and select your organization.
3. Configure:
   - **Name:** `Cortex AI [Environment]`
   - **Database Password:** *Generate a secure password and store it inside your Vault.*
   - **Region:** Select AWS region closest to your primary target users (e.g., `us-east-1` or `eu-central-1`).
   - **Pricing Tier:** Select the tier matching your plan (Free, Pro, or Enterprise).

---

## 2. Database Schema & Migration Deployment

Cortex AI leverages **Prisma ORM** to manage schemas and migration SQL scripts.

### Step 1: Obtain the Transaction Pool Connection String
1. Inside your Supabase Dashboard, navigate to **Project Settings ➔ Database**.
2. Locate the **Connection string** panel and copy the **URI** (ensure you select the `Transaction Pooler` option, port `6543`, with `?pgbouncer=true` appended).

### Step 2: Deploy Migrations
Run the deployment command locally or inside your GitHub Actions pipeline:
```bash
export DATABASE_URL="postgresql://postgres.your-project-id:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npx prisma migrate deploy
```
*Verification:* Navigate to Supabase **Table Editor** and verify that all 14 MVP tables (including `profiles`, `tasks`, `organizations`, etc.) have been successfully created.

---

## 3. Storage Buckets Configuration

Cortex AI private attachments require a dedicated Storage bucket:

### Step 1: Create Bucket
1. Navigate to **Storage** inside the Supabase Dashboard.
2. Click **New Bucket** and configure:
   - **Name:** `attachments`
   - **Privacy:** Select **Private** (ensuring file access requires signed URLs).

### Step 2: Enable Storage RLS Policies
Set the following access rules:
- **SELECT:** Only allow if user is authenticated and has membership role inside the task's organization.
- **INSERT:** Only allow files under `attachments/organizations/{organization_id}/` where user belongs to that organization.

---

## 4. Supabase Realtime Activation

Enable PostgreSQL replication listeners for instantaneous task syncing:

1. Navigate to **Database ➔ Replication** inside your Supabase Dashboard.
2. Under the `supabase_realtime` publication, click **Source** (Select tables).
3. Toggle the switches to **Active** for:
   - `tasks`
   - `notifications`
   - `ai_conversations`
