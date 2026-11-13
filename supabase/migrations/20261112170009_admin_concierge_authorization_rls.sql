-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2, Step 2B Review Only)
-- Migration 09: Admin & Concierge Database-Backed Authorization Helpers & RLS
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Depends on: Migration 01 (grants), Migration 04 (ownership RLS), Migration 08 (roles).
-- Security Design (Supabase Skill Checklist):
--   * Never reads raw_user_meta_data (user_metadata) or auth.role().
--   * Verifies active membership directly against public.admins
--     (status = 'active'::admin_status_enum — lowercase!) or public.users +
--     public.roles ('admin' / 'concierge').
--   * SECURITY DEFINER helpers live in private schema, pin search_path = '',
--     check auth.uid() IS NOT NULL, and grant EXECUTE only to authenticated.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.users u ON u.user_id = a.user_id
      WHERE a.user_id = (select auth.uid())
        AND a.status = 'active'::public.admin_status_enum
        AND u.status = 'Active'::public.status_enum
    );
$$;

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
      OR EXISTS (
        SELECT 1
        FROM public.users u
        JOIN public.roles r ON r.role_id = u.role_id
        WHERE u.user_id = (select auth.uid())
          AND u.status = 'Active'::public.status_enum
          AND lower(r.role_name) IN ('admin', 'concierge')
      )
    );
$$;

REVOKE ALL ON FUNCTION private.is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_active_admin() TO authenticated;

REVOKE ALL ON FUNCTION private.is_concierge_or_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_concierge_or_admin() TO authenticated;

-- 1. Self-lookup on admins & roles for authenticated staff only
DROP POLICY IF EXISTS "Admins can view own admin record" ON public.admins;
CREATE POLICY "Admins can view own admin record"
  ON public.admins FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id OR private.is_active_admin());

DROP POLICY IF EXISTS "Concierge and admins can view roles" ON public.roles;
CREATE POLICY "Concierge and admins can view roles"
  ON public.roles FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Users can view own assigned role" ON public.roles;
CREATE POLICY "Users can view own assigned role"
  ON public.roles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.user_id = (select auth.uid())
      AND u.role_id = roles.role_id
  ));

-- 2. Private Contact PII tables (venue_contacts & vendor_contacts)
DROP POLICY IF EXISTS "Concierge and admins can view venue contacts" ON public.venue_contacts;
CREATE POLICY "Concierge and admins can view venue contacts"
  ON public.venue_contacts FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins can view vendor contacts" ON public.vendor_contacts;
CREATE POLICY "Concierge and admins can view vendor contacts"
  ON public.vendor_contacts FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

-- 3. Concierge & Admin read visibility across leads, bookings, catalog & profiles
DROP POLICY IF EXISTS "Concierge and admins view all enquiries" ON public.enquiries;
CREATE POLICY "Concierge and admins view all enquiries"
  ON public.enquiries FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all enquiry messages" ON public.enquiry_messages;
CREATE POLICY "Concierge and admins view all enquiry messages"
  ON public.enquiry_messages FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all enquiry status history" ON public.enquiry_status_history;
CREATE POLICY "Concierge and admins view all enquiry status history"
  ON public.enquiry_status_history FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all bookings" ON public.bookings;
CREATE POLICY "Concierge and admins view all bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all booking documents" ON public.booking_documents;
CREATE POLICY "Concierge and admins view all booking documents"
  ON public.booking_documents FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all booking payments" ON public.booking_payments;
CREATE POLICY "Concierge and admins view all booking payments"
  ON public.booking_payments FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all users" ON public.users;
CREATE POLICY "Concierge and admins view all users"
  ON public.users FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Concierge and admins view all user profiles" ON public.user_profile;
CREATE POLICY "Concierge and admins view all user profiles"
  ON public.user_profile FOR SELECT TO authenticated
  USING (private.is_concierge_or_admin());

DROP POLICY IF EXISTS "Admins view all reviews and reports" ON public.reviews;
CREATE POLICY "Admins view all reviews and reports"
  ON public.reviews FOR SELECT TO authenticated
  USING (private.is_active_admin());

DROP POLICY IF EXISTS "Admins view all reports" ON public.reports;
CREATE POLICY "Admins view all reports"
  ON public.reports FOR SELECT TO authenticated
  USING (private.is_active_admin());

