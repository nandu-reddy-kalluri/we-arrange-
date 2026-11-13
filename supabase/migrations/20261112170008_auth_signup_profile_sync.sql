-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2, Step 2B Review Only)
-- Migration 08: Role Seeds & Auth User -> Public Profile Synchronization
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Preconditions verified on live DB:
--   * public.roles currently has 0 rows; public.users.role_id -> roles(role_id).
--   * public.users.user_id -> auth.users(id) ON DELETE CASCADE (0 rows).
--   * public.user_profile.user_id -> auth.users(id) ON DELETE CASCADE (0 rows).
--   * 20 existing rows in auth.users have no public.users / user_profile rows.
-- Security Design:
--   * Trigger function lives in non-exposed private schema, sets search_path='',
--     and assigns ONLY the lowest-privilege 'customer' role (never trusts
--     user-editable raw_user_meta_data for admin/vendor/concierge roles).
-- ============================================================================

-- 1. Seed canonical roles idempotently
INSERT INTO public.roles (role_name, status)
SELECT role_name, 'Active'::public.status_enum
FROM (VALUES ('customer'), ('vendor'), ('concierge'), ('admin')) AS v(role_name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles r WHERE lower(r.role_name) = v.role_name
);

-- 2. Private schema + auth signup trigger function
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer_role_id bigint;
BEGIN
  SELECT role_id INTO v_customer_role_id
  FROM public.roles
  WHERE lower(role_name) = 'customer'
  LIMIT 1;

  INSERT INTO public.users (user_id, role_id, full_name, email, status)
  VALUES (
    NEW.id,
    v_customer_role_id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'YMWA User'
    ),
    NEW.email,
    'Active'::public.status_enum
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_profile (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION private.handle_new_auth_user();
  END IF;
END $$;

-- 3. Idempotent backfill for existing 20 auth.users rows (defaults to customer)
WITH customer_role AS (
  SELECT role_id FROM public.roles WHERE lower(role_name) = 'customer' LIMIT 1
)
INSERT INTO public.users (user_id, role_id, full_name, email, status)
SELECT
  au.id,
  cr.role_id,
  COALESCE(
    NULLIF(trim(au.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(split_part(COALESCE(au.email, ''), '@', 1), ''),
    'YMWA User'
  ),
  au.email,
  'Active'::public.status_enum
FROM auth.users au
CROSS JOIN customer_role cr
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_profile (user_id)
SELECT au.id
FROM auth.users au
ON CONFLICT (user_id) DO NOTHING;

