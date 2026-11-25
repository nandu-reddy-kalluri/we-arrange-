-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2 Review Only)
-- Migration 13: Trigram Search Indexes & Numeric Plate Pricing Columns
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Items Covered:
--   1. DB-002: Enable pg_trgm extension and add GIN trigram indexes for fast
--      substring/ILIKE matching on venues (venue_name, locality_name, base_city)
--      and vendors (vendor_name, description).
--   2. BE-001: Add indexed numeric columns min_plate_price and max_plate_price
--      to public.venues to replace 5,000-row client-side chunk scanning with
--      direct B-tree indexed PostgreSQL ranges.
--   3. Backfill min_plate_price and max_plate_price from venue_price_tag and
--      price_range using regex parsing.
--   4. Grant SELECT (min_plate_price, max_plate_price) on public.venues to
--      anon and authenticated roles (following Migration 01 column-level security).
-- ============================================================================

BEGIN;

-- 1. Enable pg_trgm extension for fast substring (ILIKE '%...%') and similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. DB-002: GIN Trigram Indexes for public.venues
CREATE INDEX IF NOT EXISTS idx_venues_venue_name_trgm
  ON public.venues USING gin (venue_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_venues_locality_name_trgm
  ON public.venues USING gin (locality_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_venues_base_city_trgm
  ON public.venues USING gin (base_city gin_trgm_ops);

-- DB-002: GIN Trigram Indexes for public.vendors
CREATE INDEX IF NOT EXISTS idx_vendors_vendor_name_trgm
  ON public.vendors USING gin (vendor_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vendors_description_trgm
  ON public.vendors USING gin (description gin_trgm_ops);

-- 3. BE-001: Add structured numeric price columns to public.venues
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS min_plate_price NUMERIC,
  ADD COLUMN IF NOT EXISTS max_plate_price NUMERIC;

-- 4. B-tree indexes for fast numeric range filtering (>= min, <= max)
CREATE INDEX IF NOT EXISTS idx_venues_min_plate_price ON public.venues (min_plate_price);
CREATE INDEX IF NOT EXISTS idx_venues_max_plate_price ON public.venues (max_plate_price);

-- 5. Safe backfill of min_plate_price and max_plate_price from venue_price_tag or price_range
DO $$
DECLARE
  v_rec RECORD;
  v_prices NUMERIC[];
  v_num_text text;
  v_src text;
BEGIN
  FOR v_rec IN
    SELECT venue_id, COALESCE(venue_price_tag, price_range) AS raw_price
    FROM public.venues
    WHERE (venue_price_tag IS NOT NULL OR price_range IS NOT NULL)
      AND min_plate_price IS NULL
  LOOP
    v_src := v_rec.raw_price;
    v_prices := ARRAY[]::NUMERIC[];

    -- Extract all number sequences (handling commas like 1,500)
    FOR v_num_text IN
      SELECT (regexp_matches(v_src, '([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)', 'g'))[1]
    LOOP
      BEGIN
        v_prices := array_append(v_prices, replace(v_num_text, ',', '')::NUMERIC);
      EXCEPTION WHEN OTHERS THEN
        -- Ignore invalid numeric casts
      END;
    END LOOP;

    IF array_length(v_prices, 1) > 0 THEN
      UPDATE public.venues
      SET
        min_plate_price = (SELECT min(p) FROM unnest(v_prices) AS p WHERE p > 0),
        max_plate_price = (SELECT max(p) FROM unnest(v_prices) AS p WHERE p > 0)
      WHERE venue_id = v_rec.venue_id;
    END IF;
  END LOOP;
END $$;

-- 6. Column-level SELECT grants for anon and authenticated (least-privilege)
GRANT SELECT (min_plate_price, max_plate_price)
  ON public.venues
  TO anon, authenticated;

COMMIT;
