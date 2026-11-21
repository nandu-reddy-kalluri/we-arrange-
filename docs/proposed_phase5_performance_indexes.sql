-- ============================================================================
-- PROPOSED PERFORMANCE INDEXES (PHASE 5 REVIEW ONLY — DO NOT APPLY DIRECTLY)
-- Target: YouMarriageWeArrange Database
-- Purpose: Accelerate public catalog search, category filtering, rating sorts,
--          and batch gallery lookups without touching table structures or RLS.
-- ============================================================================

-- 1. Venues Catalog Composite & Partial Indexes
CREATE INDEX IF NOT EXISTS idx_venues_active_rating_reviews
ON public.venues (rating DESC NULLS LAST, reviews_count DESC NULLS LAST, venue_id ASC)
WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_venues_active_type_rating
ON public.venues (type_id, rating DESC NULLS LAST, venue_id ASC)
WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_venues_active_city_locality
ON public.venues (base_city, locality_name)
WHERE status = 'Active';

-- 2. Vendors Catalog Composite & Partial Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_active_rating
ON public.vendors (rating DESC NULLS LAST, vendor_id ASC)
WHERE status = 'Active';

CREATE INDEX IF NOT EXISTS idx_vendors_active_category_rating
ON public.vendors (category_id, rating DESC NULLS LAST, vendor_id ASC)
WHERE status = 'Active';

-- 3. Media & Gallery Batch Retrieval Covering Indexes
CREATE INDEX IF NOT EXISTS idx_venue_gallery_cover_sort
ON public.venue_gallery (venue_id, is_cover DESC, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_vendor_gallery_cover_sort
ON public.vendor_gallery (vendor_id, is_cover DESC, sort_order ASC);

-- 4. Entity Reviews Filter Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_venue_status_created
ON public.reviews (venue_id, status, created_at DESC)
WHERE venue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_status_created
ON public.reviews (vendor_id, status, created_at DESC)
WHERE vendor_id IS NOT NULL;
