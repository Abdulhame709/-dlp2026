-- ====================================================================
-- CORTEX AI - PRODUCTION SUPABASE RLS SECURITY VALIDATION TESTS
-- ====================================================================
-- This file acts as our verified SQL test suite to validate Row-Level
-- Security (RLS) on PostgreSQL.
-- Execute this script inside the Supabase Query Editor inside a transaction block.
-- ====================================================================

-- --------------------------------------------------------------------
-- SCENARIO 1: User A attempts to read User B's private task (Expected: DENIED)
-- --------------------------------------------------------------------
BEGIN;
  -- 1. Create User A and User B Profile records
  INSERT INTO public.profiles (id, full_name, timezone, language)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'User A', 'UTC', 'en'),
    ('22222222-2222-2222-2222-222222222222', 'User B', 'UTC', 'en');

  -- 2. Insert User B's private task
  INSERT INTO public.tasks (id, user_id, title, status, priority, created_by)
  VALUES ('66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', 'User B Secret task', 'INBOX', 'MEDIUM', '22222222-2222-2222-2222-222222222222');

  -- 3. Simulate User A Session
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; -- auth.uid() matches User A

  -- 4. Try to read User B's private task
  -- Expected outcome: This query returns ZERO rows because User A's token does not match task's user_id.
  SELECT * FROM public.tasks WHERE id = '66666666-6666-6666-6666-666666666661';

  -- 5. Double-check: Try to query count of User B's private task
  -- Expected: Count should equal 0.
  SELECT count(*) FROM public.tasks;
ROLLBACK;


-- --------------------------------------------------------------------
-- SCENARIO 2: Org Member attempts to update Billing plans (Expected: DENIED)
-- --------------------------------------------------------------------
BEGIN;
  -- 1. Create Owner & Member profiles
  INSERT INTO public.profiles (id, full_name, timezone, language)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Org Owner', 'UTC', 'en'),
    ('33333333-3333-3333-3333-333333333333', 'Org Member', 'UTC', 'en');

  -- 2. Create organization with Owner as owner_id
  INSERT INTO public.organizations (id, name, owner_id, subscription_plan, created_by)
  VALUES ('org-1111-uuid-placeholder', 'Cortex Space Inc.', '11111111-1111-1111-1111-111111111111', 'FREE', '11111111-1111-1111-1111-111111111111');

  -- 3. Map User C as standard MEMBER
  INSERT INTO public.organization_members (organization_id, user_id, role, created_by)
  VALUES ('org-1111-uuid-placeholder', '33333333-3333-3333-3333-333333333333', 'MEMBER', '11111111-1111-1111-1111-111111111111');

  -- 4. Simulate Member Session
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333'; -- User C JWT

  -- 5. Try to modify organization billing (subscription plan)
  -- Expected outcome: This operation affects 0 rows, or throws check constraint error because RLS update_policy requires role = 'ADMIN' or owner_id = auth.uid()
  UPDATE public.organizations 
  SET subscription_plan = 'ENTERPRISE' 
  WHERE id = 'org-1111-uuid-placeholder';
ROLLBACK;


-- --------------------------------------------------------------------
-- SCENARIO 3: Org Owner attempts to modify organization details (Expected: ALLOW)
-- --------------------------------------------------------------------
BEGIN;
  -- 1. Create Owner profile
  INSERT INTO public.profiles (id, full_name, timezone, language)
  VALUES ('11111111-1111-1111-1111-111111111111', 'Org Owner', 'UTC', 'en');

  -- 2. Create organization
  INSERT INTO public.organizations (id, name, owner_id, subscription_plan, created_by)
  VALUES ('org-1111-uuid-placeholder', 'Cortex Space Inc.', '11111111-1111-1111-1111-111111111111', 'FREE', '11111111-1111-1111-1111-111111111111');

  -- 3. Simulate Owner Session
  SET LOCAL ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  -- 4. Attempt to change Organization name
  -- Expected: ALLOWED (Updates 1 row successfully because owner_id matches auth.uid()).
  UPDATE public.organizations 
  SET name = 'Cortex Enterprise Space' 
  WHERE id = 'org-1111-uuid-placeholder';
ROLLBACK;
