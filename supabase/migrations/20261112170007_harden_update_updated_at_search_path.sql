-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2, Step 2B Review Only)
-- Migration 07: Harden Function search_path on update_updated_at_column
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Preconditions verified on live DB:
--   * public.update_updated_at_column() is SECURITY INVOKER with mutable
--     search_path (0011_function_search_path_mutable) and uses only NOW().
--   * 3 triggers invoke update_updated_at_column() (banners, bookings, reports);
--     29 triggers invoke extensions.moddatetime('updated_at').
-- ============================================================================

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = '';

