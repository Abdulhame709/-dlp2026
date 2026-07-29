# Real Cloud Connection Step-by-Step Guide

**Author:** SRE Lead & Customer Experience Director  
**Target:** Staging & Production Beta Pioneers  
**Version:** v1.0.0  
**Date:** July 28, 2026  

---

## 🚀 Pre-Connection Preparation
This guide explains exactly how to connect your Cortex AI repository branch `arena/019fa52b-dlp2026` to a live PostgreSQL database and launch your private application. 

Follow these steps exactly to go-live with zero errors.

---

## 🛠 Step 1: Initialize Your Supabase Database

1. **Open your browser** and navigate to the [Supabase Dashboard](https://supabase.com/dashboard).
2. **Log in** or create an account.
3. Click **New Project** and select your organization.
4. **Fill out the Project details:**
   - **Project Name:** `Cortex AI Prod`
   - **Database Password:** Click *Generate a password*, copy it, and store it safely in your password manager.
   - **Region:** Select the AWS region closest to your location (e.g. `us-east-1` or `eu-central-1`).
5. Click **Create new project** and wait 2 minutes for Supabase to spin up your secure cloud PostgreSQL database instance.

---

## 🛠 Step 2: Retrieve and Deploy Database Migrations

### 2.1 Copy Database Connection Strings
1. Inside your new Supabase Project dashboard, go to the left sidebar and click **Settings** (the Gear icon).
2. Click **Database** and scroll down to the **Connection string** panel.
3. Select **URI**, choose **Transaction Pooler** (using Port `6543`), and **Copy the Connection String**.
   *Note:* Replace the placeholder `[YOUR-PASSWORD]` inside the connection string with the Database Password you generated in Step 1.

### 2.2 Deploy the Schema (For Developers)
Open your local terminal inside the cloned project directory and run these exact commands to push the database tables and triggers to your live Supabase cloud database:
```bash
export DATABASE_URL="postgresql://postgres.your-project-id:your-db-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
npx prisma migrate deploy
```
*Verification Check:* Go to the **Table Editor** on your Supabase dashboard and confirm that the tables (`profiles`, `tasks`, `organizations`, `activity_logs`, etc.) are created and active.

---

## 🛠 Step 3: Setup Private Storage & Realtime Channels

### 3.1 Create Private Attachments Bucket
1. Inside your Supabase Project dashboard, click **Storage** in the left sidebar.
2. Click **New Bucket**, name it exactly `attachments`, and toggle the **Private** switch to **Active**. Click **Save**.

### 3.2 Enable Realtime Replication
1. Navigate to **Database** in the left sidebar and click **Replication**.
2. Click **Source** (Select tables) under the `supabase_realtime` publication.
3. Toggle the switches to **Active** for these tables: `tasks`, `notifications`, and `ai_conversations`.

---

## 🛠 Step 4: Configure Vercel Hosting & Environment Keys

1. **Open your browser** and navigate to [Vercel](https://vercel.com).
2. Click **Add New... ➔ Project** and import your GitHub repository.
3. Select your active working branch `arena/019fa52b-dlp2026`.
4. Expand the **Environment Variables** panel and copy-paste these exact variable keys and their corresponding values (which you retrieved from your Supabase and OpenAI dashboards):

   | Environment Variable Key | Value to Paste |
   | :--- | :--- |
   | `DATABASE_URL` | *Paste your Transaction Pooler string from Step 2.1* |
   | `NEXT_PUBLIC_SUPABASE_URL` | *Paste your Supabase Project URL (found in Settings -> API)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Paste your Supabase public Anon Key (found in Settings -> API)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *Paste your private Service Role Key (found in Settings -> API)* |
   | `OPENAI_API_KEY` | *Paste your OpenAI Developer API Key* |
   | `USE_MOCK` | Type: `false` (This disables mock mode and connects live data!) |

5. Click **Deploy!** Vercel will automatically compile and launch your private Cortex AI platform.

---

## 🧪 Step 5: Post-Connection Verification

Once Vercel reports a successful deployment, verify your live cloud workspace:

1. Click your **Vercel URL** to open your private live application.
2. Click **Start with AI**, create an account, and verify that the registration succeeds.
3. Create your first Goal, click **Roadmap**, and verify that the AI-generated tasks are successfully saved to your database and visible on your dashboard!
4. run the automated post-deployment validation checks from your terminal:
   ```bash
   npm run test:live
   ```
   *Success Indicator:* The console should report all live verification tests as **PASS**, certifying your platform is 100% stable!
