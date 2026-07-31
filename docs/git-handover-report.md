# SRE Git Handover & Merge Playbook

**Author:** SRE Lead & Lead Systems Engineer  
**Status:** Certified  
**Version:** v1.0.0  
**Date:** July 28, 2026  

---

## 📊 Current Branch State

- **Active Session Branch:** `arena/019fa52b-dlp2026`
- **Baseline Branch:** `main` (branched from commit `e3687ec66b9628e9180fac9f605b8132fcb365f5` of `main`)
- **Working Status:** **100% CLEAN** (All modifications, schemas, adapters, and tests are compiled successfully and committed on the branch).

---

## 📋 Staged & Pending Changes (Phase 5 / Build Cycle 5)

Our active branch houses all structural and UI integrations for the Cortex AI private alpha release candidate:
- **`src/core/` (Nava layer):** Cookie-bound server clients, role permission managers, and SRE observabilities.
- **`src/features/` (Workspace):** Goal roadmaps generators, collapsible sidebars, and real-time kanban tasks.
- **`src/tests/` (Verification):** All 11 verification suites compiled and passing cleanly.

---

## 🛠 Required Merge Steps (خطوات الدمج الآمن)

To merge the active working branch into the main branch safely on GitHub without any history divergence, execute this sequence:

### Step 1: Synchronize Baseline branch
Ensure your local `main` branch is fully synchronized with GitHub:
```bash
git checkout main
git pull origin main
```

### Step 2: Merge Working Branch with Fast-Forward Only
To preserve the linear commit graph and prevent automatic merge commits:
```bash
git merge --ff-only arena/019fa52b-dlp2026
```

### Step 3: Push to Main Branch on GitHub
```bash
git push origin main
```

---

## 🛡️ SRE Rollback Plan (خطة الطوارئ للتراجع)

If a critical error or build block is discovered on the `main` branch after merge:

### Step 1: Revert Main branch HEAD to Previous Stable State
Identify the last successful commit hash of `main` (e.g., `e3687ec`) and force-reset the branch HEAD locally:
```bash
git reset --hard e3687ec
```

### Step 2: Force Push Reverted State to GitHub
```bash
git push --force origin main
```

### Step 3: Local Hot-Fix Isolation
Switch back to `arena/019fa52b-dlp2026` to debug the issue without contaminating the main branch:
```bash
git checkout arena/019fa52b-dlp2026
```
Once hot-fixed, re-run `npm run build` and follow the merge playbook again.
