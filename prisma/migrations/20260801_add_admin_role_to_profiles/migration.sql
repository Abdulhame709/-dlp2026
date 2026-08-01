-- Step 3: Add admin role to profiles table
-- Enables server-side admin authorization for /app/admin route

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- RLS policy: only the user themselves can read their own admin status
-- (SELECT already allowed via existing profiles_select policy)
-- Admin status can only be set by existing admins or via service role
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR (
    -- Allow existing admins to grant admin to others
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  ))
  WITH CHECK (id = auth.uid() OR (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  ));
