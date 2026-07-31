# Cortex AI - Non-Programmer Manual Deployment Checklist

**Author:** Lead DevOps Architect  
**Status:** Certified & Ready for Manual Execution  
**Version:** v1.0.0  
**Date:** July 28, 2026  

---

## 📋 Pre-Flight Checklist

Before you begin, ensure you have active accounts on these three platforms:
- [ ] **GitHub Account** (where your Cortex AI repository is hosted).
- [ ] **Supabase Account** (for your database, storage, realtime, and authentication).
- [ ] **Vercel Account** (for hosting your fast Next.js 15 web application).
- [ ] **OpenAI Account** (for your AI Assistant and planning credits).

---

## 🛠 Step-by-Step Deployment Instructions

### Part 1: Setting up Supabase (The Database & Auth Brain)

1. **Log in to [Supabase](https://supabase.com)** and click **New Project**.
2. **Configure your project name** (e.g., `Cortex AI Prod`) and generate a secure **Database Password**. Select your geographic region.
3. **Database Schema Setup:**
   - Go to **Project Settings ➔ Database ➔ Connection string**.
   - Copy the **URI** string (make sure to select the `Transaction Pooler` option, port `6543`, with `?pgbouncer=true` appended).
4. **Create Cloud Storage Buckets:**
   - Go to the **Storage** dashboard.
   - Click **New Bucket**, name it `attachments`, and set privacy to **Private**.
5. **Activate Realtime Channels:**
   - Go to **Database ➔ Replication**.
   - Enable replication for these tables: `tasks`, `notifications`, and `ai_conversations`.

---

### Part 2: Setting up Vercel (The Web Host)

1. **Log in to [Vercel](https://vercel.com)** and click **Add New... ➔ Project**.
2. **Import your GitHub repository** branch `arena/019fa52b-dlp2026` or the merged `main` branch.
3. **Set Environment Variables:**
   Expand the **Environment Variables** panel and add these exact key-value pairs (retrieved from your Supabase and OpenAI dashboards):

   | Variable Name | Description | Where to find it |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | Direct DB Connection String | Supabase Dashboard -> Database -> Connection String |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Supabase Dashboard -> API -> Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Supabase Dashboard -> API -> Anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Key | Supabase Dashboard -> API -> Service_role key |
   | `OPENAI_API_KEY` | OpenAI Developer Key | OpenAI Developer Dashboard -> API Keys |
   | `USE_MOCK` | Set explicitly to `false` | Type: `false` (Disables Mocks, Activates Supabase!) |

4. **Click Deploy!** Vercel will automatically compile and launch your live Cortex AI application.

---

## 🧪 Post-Connection Verification Tests

Immediately after your Vercel deployment completes successfully, execute these validations to certify that your private application works:

1. **Login and Register test:** Visit your live Vercel URL, click **Start with AI**, create an account, and confirm that email verification works.
2. **Onboarding check:** Verify that you are redirected to the onboarding preferences screen, and ensure you can create your first workspace organization cleanly.
3. **Smart Task boards:** Create a task, toggle its status, and drag-and-drop a card between Kanban columns.
4. **Run Live SRE Verification Audits:** If you have access to a terminal, navigate to the project directory and run this command:
   ```bash
   npm run test:live
   ```
   *Success Metrics:* The command should output `Database: PASS`, `Authentication: PASS`, `Storage: PASS`, and `Deployment: READY` in bold green!
