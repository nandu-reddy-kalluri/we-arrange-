-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2, Step 2B Review Only)
-- Migration 03: Public Read-Only Catalog, CMS & Location RLS Policies
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Depends on: Migration 01 (grants) & Migration 02 (venues.status = 'Active').
-- Strict Rules:
--   * SELECT only for anon, authenticated on active/published public records.
--   * venue_contacts & vendor_contacts receive ZERO public SELECT policies.
--   * Uses TO anon, authenticated (never deprecated auth.role()).
-- ============================================================================

-- 1. Fix banners policy target role ({public} -> {anon, authenticated})
DROP POLICY IF EXISTS "Public can view banners" ON public.banners;
CREATE POLICY "Public can view banners"
  ON public.banners FOR SELECT TO anon, authenticated
  USING (status = 'active'::public.banner_status_enum);

-- 2. Venues & public venue child tables (parent status = 'Active')
DROP POLICY IF EXISTS "Public can view active venues" ON public.venues;
CREATE POLICY "Public can view active venues"
  ON public.venues FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active venue gallery" ON public.venue_gallery;
CREATE POLICY "Public can view active venue gallery"
  ON public.venue_gallery FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_gallery.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue pricing" ON public.venue_pricing;
CREATE POLICY "Public can view active venue pricing"
  ON public.venue_pricing FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_pricing.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue faq" ON public.venue_faq;
CREATE POLICY "Public can view active venue faq"
  ON public.venue_faq FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_faq.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue room details" ON public.venue_room_details;
CREATE POLICY "Public can view active venue room details"
  ON public.venue_room_details FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_room_details.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue amenities" ON public.venue_amenities;
CREATE POLICY "Public can view active venue amenities"
  ON public.venue_amenities FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_amenities.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue availability" ON public.venue_availability;
CREATE POLICY "Public can view active venue availability"
  ON public.venue_availability FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_availability.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue features" ON public.venue_features;
CREATE POLICY "Public can view active venue features"
  ON public.venue_features FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_features.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue menus" ON public.venue_menus;
CREATE POLICY "Public can view active venue menus"
  ON public.venue_menus FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_menus.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue packages" ON public.venue_packages;
CREATE POLICY "Public can view active venue packages"
  ON public.venue_packages FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_packages.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue parking" ON public.venue_parking;
CREATE POLICY "Public can view active venue parking"
  ON public.venue_parking FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_parking.venue_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active venue videos" ON public.venue_videos;
CREATE POLICY "Public can view active venue videos"
  ON public.venue_videos FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.venue_id = venue_videos.venue_id AND v.status = 'Active'::public.status_enum));

-- 3. Vendors & public vendor child tables (parent status = 'Active')
DROP POLICY IF EXISTS "Public can view active vendors" ON public.vendors;
CREATE POLICY "Public can view active vendors"
  ON public.vendors FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active vendor gallery" ON public.vendor_gallery;
CREATE POLICY "Public can view active vendor gallery"
  ON public.vendor_gallery FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_gallery.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor pricing" ON public.vendor_pricing;
CREATE POLICY "Public can view active vendor pricing"
  ON public.vendor_pricing FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_pricing.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor services" ON public.vendor_services;
CREATE POLICY "Public can view active vendor services"
  ON public.vendor_services FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_services.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor availability" ON public.vendor_availability;
CREATE POLICY "Public can view active vendor availability"
  ON public.vendor_availability FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_availability.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor faq" ON public.vendor_faq;
CREATE POLICY "Public can view active vendor faq"
  ON public.vendor_faq FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_faq.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor packages" ON public.vendor_packages;
CREATE POLICY "Public can view active vendor packages"
  ON public.vendor_packages FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_packages.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor social links" ON public.vendor_social_links;
CREATE POLICY "Public can view active vendor social links"
  ON public.vendor_social_links FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_social_links.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor team" ON public.vendor_team;
CREATE POLICY "Public can view active vendor team"
  ON public.vendor_team FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_team.vendor_id AND v.status = 'Active'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active vendor videos" ON public.vendor_videos;
CREATE POLICY "Public can view active vendor videos"
  ON public.vendor_videos FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.vendor_id = vendor_videos.vendor_id AND v.status = 'Active'::public.status_enum));

-- 4. Public published reviews, editorial, locations & reference lookups
DROP POLICY IF EXISTS "Public can view published reviews" ON public.reviews;
CREATE POLICY "Public can view published reviews"
  ON public.reviews FOR SELECT TO anon, authenticated
  USING (status IN ('Active'::public.status_enum, 'Published'::public.status_enum, 'Approved'::public.status_enum));

DROP POLICY IF EXISTS "Public can view published review images" ON public.review_images;
CREATE POLICY "Public can view published review images"
  ON public.review_images FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.review_id = review_images.review_id
      AND r.status IN ('Active'::public.status_enum, 'Published'::public.status_enum, 'Approved'::public.status_enum)
  ));

DROP POLICY IF EXISTS "Public can view review votes" ON public.review_votes;
CREATE POLICY "Public can view review votes"
  ON public.review_votes FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.review_id = review_votes.review_id
      AND r.status IN ('Active'::public.status_enum, 'Published'::public.status_enum, 'Approved'::public.status_enum)
  ));

DROP POLICY IF EXISTS "Public can view blog tags" ON public.blog_tags;
CREATE POLICY "Public can view blog tags"
  ON public.blog_tags FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.blogs b WHERE b.blog_id = blog_tags.blog_id AND b.status = 'Published'::public.status_enum));

DROP POLICY IF EXISTS "Public can view published blog comments" ON public.blog_comments;
CREATE POLICY "Public can view published blog comments"
  ON public.blog_comments FOR SELECT TO anon, authenticated
  USING (
    status IN ('Active'::public.status_enum, 'Published'::public.status_enum, 'Approved'::public.status_enum)
    AND EXISTS (
      SELECT 1 FROM public.blogs b
      WHERE b.blog_id = blog_comments.blog_id
        AND b.status = 'Published'::public.status_enum
    )
  );

DROP POLICY IF EXISTS "Public can view blog likes" ON public.blog_likes;
CREATE POLICY "Public can view blog likes"
  ON public.blog_likes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.blogs b WHERE b.blog_id = blog_likes.blog_id AND b.status = 'Published'::public.status_enum));

DROP POLICY IF EXISTS "Public can view inspirations" ON public.inspirations;
CREATE POLICY "Public can view inspirations"
  ON public.inspirations FOR SELECT TO anon, authenticated
  USING (status IN ('Active'::public.status_enum, 'Published'::public.status_enum));

DROP POLICY IF EXISTS "Public can view inspiration gallery" ON public.inspiration_gallery;
CREATE POLICY "Public can view inspiration gallery"
  ON public.inspiration_gallery FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.inspirations i
    WHERE i.inspiration_id = inspiration_gallery.inspiration_id
      AND i.status IN ('Active'::public.status_enum, 'Published'::public.status_enum)
  ));

DROP POLICY IF EXISTS "Public can view real weddings" ON public.real_weddings;
CREATE POLICY "Public can view real weddings"
  ON public.real_weddings FOR SELECT TO anon, authenticated
  USING (status IN ('Active'::public.status_enum, 'Published'::public.status_enum));

DROP POLICY IF EXISTS "Public can view wedding gallery" ON public.wedding_gallery;
CREATE POLICY "Public can view wedding gallery"
  ON public.wedding_gallery FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.real_weddings w WHERE w.wedding_id = wedding_gallery.wedding_id AND w.status IN ('Active'::public.status_enum, 'Published'::public.status_enum)));

DROP POLICY IF EXISTS "Public can view wedding tags" ON public.wedding_tags;
CREATE POLICY "Public can view wedding tags"
  ON public.wedding_tags FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.real_weddings w WHERE w.wedding_id = wedding_tags.wedding_id AND w.status IN ('Active'::public.status_enum, 'Published'::public.status_enum)));

DROP POLICY IF EXISTS "Public can view wedding vendors" ON public.wedding_vendors;
CREATE POLICY "Public can view wedding vendors"
  ON public.wedding_vendors FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.real_weddings w WHERE w.wedding_id = wedding_vendors.wedding_id AND w.status IN ('Active'::public.status_enum, 'Published'::public.status_enum)));

DROP POLICY IF EXISTS "Public can view published page seo" ON public.seo;
CREATE POLICY "Public can view published page seo"
  ON public.seo FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.pages p WHERE p.page_id = seo.page_id AND p.status = 'Published'::public.status_enum));

DROP POLICY IF EXISTS "Public can view active localities" ON public.localities;
CREATE POLICY "Public can view active localities"
  ON public.localities FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active currencies" ON public.currencies;
CREATE POLICY "Public can view active currencies"
  ON public.currencies FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active languages" ON public.languages;
CREATE POLICY "Public can view active languages"
  ON public.languages FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view popular searches" ON public.popular_searches;
CREATE POLICY "Public can view popular searches"
  ON public.popular_searches FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view booking status" ON public.booking_status;
CREATE POLICY "Public can view booking status"
  ON public.booking_status FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can view active invite templates" ON public.invite_templates;
CREATE POLICY "Public can view active invite templates"
  ON public.invite_templates FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active report reasons" ON public.report_reasons;
CREATE POLICY "Public can view active report reasons"
  ON public.report_reasons FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

-- 5. Tighten pre-existing reference lookup policies (USING (true) -> active status)
DROP POLICY IF EXISTS "Public can view areas" ON public.areas;
CREATE POLICY "Public can view areas"
  ON public.areas FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view cities" ON public.cities;
CREATE POLICY "Public can view cities"
  ON public.cities FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view states" ON public.states;
CREATE POLICY "Public can view states"
  ON public.states FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
CREATE POLICY "Public can view countries"
  ON public.countries FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view venue types" ON public.venue_types;
CREATE POLICY "Public can view venue types"
  ON public.venue_types FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view vendor categories" ON public.vendor_categories;
CREATE POLICY "Public can view vendor categories"
  ON public.vendor_categories FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view blog categories" ON public.blog_categories;
CREATE POLICY "Public can view blog categories"
  ON public.blog_categories FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view inspiration categories" ON public.inspiration_categories;
CREATE POLICY "Public can view inspiration categories"
  ON public.inspiration_categories FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

-- 6. CMS & content tables public view policies (published/active content)
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs"
  ON public.blogs FOR SELECT TO anon, authenticated
  USING (status = 'Published'::public.status_enum);

DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages"
  ON public.pages FOR SELECT TO anon, authenticated
  USING (status = 'Published'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active faqs" ON public.faqs;
CREATE POLICY "Public can view active faqs"
  ON public.faqs FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active home sections" ON public.home_sections;
CREATE POLICY "Public can view active home sections"
  ON public.home_sections FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials"
  ON public.testimonials FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

DROP POLICY IF EXISTS "Public can view active themes" ON public.themes;
CREATE POLICY "Public can view active themes"
  ON public.themes FOR SELECT TO anon, authenticated
  USING (status = 'Active'::public.status_enum);

