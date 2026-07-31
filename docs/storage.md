# 20. Supabase Cloud Storage Integration Specification

**Author:** Security Engineer & Cloud Storage SRE  
**Version:** 1.0  
**Date:** July 27, 2026  

---

## 1. Cloud Storage Architecture Topology

To maintain database performance and low query latencies, physical files (PDFs, images, docx attachments) are never stored inside our PostgreSQL tables. File objects are stored inside **Supabase Storage buckets**, with only the metadata references persisting inside our database:

```
[ User Client ] ➔ (1. Upload file) ➔ [ Supabase Storage: 'attachments' bucket ]
       │                                                    │
       │ (2. Returns secure object url)                     │ (Natively isolates files)
       ▼                                                    ▼
[ User Client ] ➔ (3. Saves metadata row) ➔ [ PostgreSQL Table: 'task_attachments' ]
```

---

## 2. Secure Storage Buckets Layout

We configure an isolated private storage bucket named **`attachments`** in Supabase:
- **Folder Schema Path:** `attachments/organizations/{organization_id}/tasks/{task_id}/{file_name}`
- **RLS Enforced Access:** Supabase Storage policies match the user's organization credentials to restrict file access. Unauthorized users cannot fetch or download files.

---

## 3. Upload & Security Validation Gateways

All client-side file uploads pass through strict security validation before being transmitted:

1. **File Size Validation:** Maximum file size is strictly capped at **10MB** for all tiers. Larger uploads are aborted.
2. **MIME Type Validation:** We enforce a strict whitelist to prevent executable or script injections:
   - *Allowed Image Formats:* `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
   - *Allowed Document Formats:* `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`.
   - *Forbidden:* `application/x-sh`, `application/javascript`, `.exe`, `.bat`, etc.

---

## 4. Secure Signed URLs Resolution
To prevent unauthorized link sharing or exposure of private company documentation:
- The `attachments` storage bucket is set to **private**.
- When a user views task details, the platform requests a **temporary secure signed URL** with a short expiration lifespan (e.g., 60 seconds). Once expired, the URL becomes invalid, neutralizing unauthorized file leaks.
