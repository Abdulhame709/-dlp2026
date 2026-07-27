-- ====================================================================
-- CORTEX AI - PRODUCTION RLS POLICIES VERIFICATION SCRIPT
-- ====================================================================
-- This SQL script demonstrates the exact verification tests used
-- to audit our database security rules and Row-Level Security (RLS).
-- All checks are executed inside isolated transactions that are rolled back.
-- ====================================================================

-- --------------------------------------------------------------------
-- CASE 1: Verification of User Isolation (عزل المستخدمين)
-- --------------------------------------------------------------------
BEGIN;
  -- Simulate a real authenticated User A session
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; -- User A UUID

  -- Audit SELECT: Expecting only User A private tasks. No rows belonging to User B should return.
  SELECT id, title, user_id FROM public.tasks WHERE organization_id IS NULL;

  -- Audit INSERT: Attempting to insert a task belonging to User B
  -- Expecting PostgreSQL to throw an RLS check constraint error, or filter the row.
  -- This is because user_id in checking must match auth.uid()
  -- INSERT INTO public.tasks (user_id, title) VALUES ('22222222-2222-2222-2222-222222222222', 'Hacked Task');
ROLLBACK;


-- --------------------------------------------------------------------
-- CASE 2: Verification of Tenant Isolation (عزل المؤسسات والشركات)
-- --------------------------------------------------------------------
BEGIN;
  -- Simulate User A who is ONLY a member of Organization 1
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  -- Audit SELECT: Requesting tasks belonging to Organization 2 (which User A is not a member of)
  -- Expecting: 0 rows returned, even if Organization 2 exists in PostgreSQL.
  SELECT * FROM public.tasks WHERE organization_id = 'org-2-uuid-mock-placeholder';

  -- Audit UPDATE: Attempting to modify organization 2 metadata
  -- Expecting: 0 rows affected, or transaction denied.
  UPDATE public.organizations SET name = 'Hacked Name' WHERE id = 'org-2-uuid-mock-placeholder';
ROLLBACK;


-- --------------------------------------------------------------------
-- CASE 3: Verification of Role-Based Access Control (التحقق من الصلاحيات)
-- --------------------------------------------------------------------
BEGIN;
  -- Simulate User C who is a standard MEMBER (not Admin/Owner) of Org 1
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';

  -- Audit UPDATE: Attempting to update the Organization name
  -- Expecting: Denied by RLS policy because User C is only a standard MEMBER, not OWNER or ADMIN.
  UPDATE public.organizations SET name = 'Unauthorized Rename' WHERE id = 'org-1-uuid-mock-placeholder';
ROLLBACK;


-- --------------------------------------------------------------------
-- CASE 4: Verification of Self-Profile Updates (تعديل البيانات الشخصية)
-- --------------------------------------------------------------------
BEGIN;
  -- Simulate User A
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  -- Audit SELECT: Should be allowed to read profiles of self or other active users (standard SaaS lookup)
  SELECT id, full_name FROM public.profiles;

  -- Audit UPDATE: Attempting to update User B's profile info
  -- Expecting: Denied (0 rows updated) because RLS requires profiles.id = auth.uid()
  UPDATE public.profiles SET full_name = 'Hacked User B Name' WHERE id = '22222222-2222-2222-2222-222222222222';
ROLLBACK;
