-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Backend Implementation Foundation)
-- Migration 11: Customer Preferences, Site Visit Coordination, Booking-Quote
--               Linkage, Payment Idempotency & Reference Seeds
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Depends on: Migrations 01, 08, 09, 10.
-- Security & Integrity Design:
--   * Strictly additive, nullable / defaulted alterations preserving existing data.
--   * Prevents duplicate booking creation from the same accepted quote.
--   * Enforces uniqueness on payment idempotency keys & transaction references.
--   * Seeds canonical booking_status lifecycle rows idempotently.
-- ============================================================================

-- 1. Customer preferences stored in user_profile (notifications, city/budget preferences)
ALTER TABLE public.user_profile
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Concierge site-visit coordination fields on enquiries
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS site_visit_at timestamptz,
  ADD COLUMN IF NOT EXISTS site_visit_status text,
  ADD COLUMN IF NOT EXISTS site_visit_notes text;

ALTER TABLE public.enquiries
  DROP CONSTRAINT IF EXISTS enquiries_site_visit_status_check;

ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_site_visit_status_check CHECK (
    site_visit_status IS NULL
    OR site_visit_status IN ('Requested', 'Scheduled', 'Completed', 'Cancelled')
  );

-- 3. Link bookings back to enquiry and accepted quotation (idempotent conversion)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS enquiry_id bigint REFERENCES public.enquiries (enquiry_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quote_id bigint REFERENCES public.quotes (quote_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_enquiry_id ON public.bookings (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_bookings_quote_id ON public.bookings (quote_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_quote_id
  ON public.bookings (quote_id)
  WHERE quote_id IS NOT NULL;

-- 4. Payment & transaction idempotency protection
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key
  ON public.payments (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference_unique
  ON public.transactions (transaction_reference)
  WHERE transaction_reference IS NOT NULL;

-- 5. Seed canonical booking_status lifecycle values idempotently
INSERT INTO public.booking_status (status_name, description)
SELECT v.status_name, v.description
FROM (
  VALUES
    ('Pending', 'Booking initialized and awaiting confirmation or deposit'),
    ('Confirmed', 'Booking confirmed with venue/vendor and deposit recorded'),
    ('In Progress', 'Event preparation or active coordination underway'),
    ('Completed', 'Event concluded and settled'),
    ('Cancelled', 'Booking cancelled'),
    ('Refunded', 'Payment refunded after cancellation')
) AS v(status_name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.booking_status bs WHERE lower(bs.status_name) = lower(v.status_name)
);

