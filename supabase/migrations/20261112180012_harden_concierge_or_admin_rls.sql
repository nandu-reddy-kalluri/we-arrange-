-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED TO LIVE DATABASE (Phase 2 F-01 Remediation)
-- Migration 12: Harden private.is_concierge_or_admin() RLS Helper
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Depends on: Migration 09 (admin_concierge_authorization_rls).
-- Purpose:
--   Eliminate the inactive-admin privilege fallback where an authenticated user
--   whose public.admins.status was set to 'inactive', 'pending', or 'suspended'
--   (or who lacks an active public.admins row) could satisfy
--   private.is_concierge_or_admin() through lower(r.role_name) = 'admin'.
--
--   Admin privileges now require private.is_active_admin() exclusively.
--   Concierge privileges require an Active user + Active 'concierge' role AND
--   the absence of any non-active public.admins row for auth.uid().
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION private.is_concierge_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL
    AND (
      private.is_active_admin()
      OR (
        NOT EXISTS (
          SELECT 1
          FROM public.admins a
          WHERE a.user_id = (select auth.uid())
            AND a.status <> 'active'::public.admin_status_enum
        )
        AND EXISTS (
          SELECT 1
          FROM public.users u
          JOIN public.roles r ON r.role_id = u.role_id
          WHERE u.user_id = (select auth.uid())
            AND u.status = 'Active'::public.status_enum
            AND r.status = 'Active'::public.status_enum
            AND lower(r.role_name) = 'concierge'
        )
      )
    );
$$;

REVOKE ALL ON FUNCTION private.is_concierge_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_concierge_or_admin() TO authenticated;

COMMIT;
