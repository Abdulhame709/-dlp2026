# 22. Environment Setup & Local Startup Guide

**Author:** Lead DevOps Architect  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Local Environment Prerequisites

To run Cortex AI locally, ensure your machine has the following tools installed:
- **Node.js:** Modern LTS version (v22+ recommended).
- **NPM / PNPM:** Package manager configured with standard access rights.
- **Docker (Optional):** If running local PostgreSQL/Supabase containers.

---

## 2. Step-by-Step Initial Startup Guide

Follow these commands to clone, initialize, compile, and run the platform locally:

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/Abdulhame709/-dlp2026.git
cd -dlp2026
npm install
```

### Step 2: Configure Local Environment Variables
Copy the production environment variables template to your local environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` and substitute the mock placeholders with your actual Supabase URL, Anon Key, and OpenAI API credentials.

### Step 3: Run Database Schema Migrations & Seeding
Deploy the PostgreSQL schemas to your Supabase development database and run the mock seed script:
```bash
npx prisma migrate dev --name init_cortex_db
npx prisma db seed
```

### Step 4: Run the Local Development Server
Start the Next.js fast development server with Turbopack enabled:
```bash
npm run dev
```
Open `http://localhost:3000` inside your browser. The platform will automatically load!

---

## 3. Standard Staging & Production Deployment Commands

- **Build Codebase:** `npm run build`
- **Lint Codebase:** `npm run lint`
- **Run Custom DB/Auth Tests:** `npm run test:db` and `npm run test:auth`
- **Deploy Migrations to Live Database:** `npx prisma migrate deploy`
