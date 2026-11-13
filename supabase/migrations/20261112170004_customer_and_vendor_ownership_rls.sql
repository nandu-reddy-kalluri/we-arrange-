-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Corrected M04 Candidate — Review Only)
-- Migration 04: Customer & Vendor Ownership RLS Policies (Security Corrected)
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Depends on: Migration 01 (grants), Migration 03 (public catalog & CMS RLS).
-- Compatible with: Migration 09 (shares `private` schema cleanly).
-- Security Corrections Applied:
--   1. Adds `private.is_vendor_owner(bigint)` and `private.is_review_owner(bigint)`
--      SECURITY DEFINER helpers (`SET search_path = ''`, bound strictly to
--      `(select auth.uid())`, EXECUTE restricted to `authenticated`) so ownership
--      RLS policies never require exposing `vendors.user_id` or `reviews.user_id`
--      via column-level `SELECT` grants.
--   2. Replaces `blog_comments` `FOR ALL` with explicit SELECT / INSERT / UPDATE / DELETE
--      policies requiring `status = 'Pending'::public.status_enum` and a
--      `Published` parent blog on INSERT/UPDATE. Tightens `blog_likes` INSERT
--      to require a `Published` parent blog.
--   3. Removes `"Authenticated users view active coupons"` and revokes direct
--      client `SELECT` on `public.coupons` to prevent coupon enumeration.
--   4. Grants only the minimum RLS-bounded columns missing from M01 for backend
--      compatibility: `UPDATE (status)` on `public.reviews` (locked to `'Pending'`
--      by RLS WITH CHECK) and `UPDATE (vote_type)` on `public.review_votes`
--      (locked to `(select auth.uid()) = user_id`). Keeps `user_id` hidden.
-- ============================================================================

-- 0. Private security-definer ownership helpers (never grant to PUBLIC or anon)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_vendor_owner(target_vendor_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL
    AND target_vendor_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.vendors v
      WHERE v.vendor_id = target_vendor_id
        AND v.user_id = (select auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION private.is_review_owner(target_review_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (select auth.uid()) IS NOT NULL
    AND target_review_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.reviews r
      WHERE r.review_id = target_review_id
        AND r.user_id = (select auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION private.is_vendor_owner(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_vendor_owner(bigint) TO authenticated;

REVOKE ALL ON FUNCTION private.is_review_owner(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_review_owner(bigint) TO authenticated;

-- Minimum RLS-bounded grant alignment (keeps `user_id` hidden from public SELECT)
-- reviews.status UPDATE is locked to `'Pending'` via policy WITH CHECK below.
GRANT UPDATE (status) ON public.reviews TO authenticated;
-- review_votes.vote_type UPDATE is locked to own rows via policy USING/WITH CHECK below.
GRANT UPDATE (vote_type) ON public.review_votes TO authenticated;
-- Prevent direct client table enumeration of coupon codes & discount rules.
REVOKE SELECT ON public.coupons FROM anon, authenticated;

-- 1. Users & user_profile (self-owned)
DROP POLICY IF EXISTS "Users can view own account" ON public.users;
CREATE POLICY "Users can view own account"
  ON public.users FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own safe account fields" ON public.users;
CREATE POLICY "Users can update own safe account fields"
  ON public.users FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profile;
CREATE POLICY "Users can view own profile"
  ON public.user_profile FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profile;
CREATE POLICY "Users can create own profile"
  ON public.user_profile FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profile;
CREATE POLICY "Users can update own profile"
  ON public.user_profile FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 2. Favorites & collections (customer self-owned)
DROP POLICY IF EXISTS "Customers manage own favorites" ON public.favorites;
CREATE POLICY "Customers manage own favorites"
  ON public.favorites FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers manage own collections" ON public.collections;
CREATE POLICY "Customers manage own collections"
  ON public.collections FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 3. Enquiries, messages & status history (customer read/create own)
DROP POLICY IF EXISTS "Customers view own enquiries" ON public.enquiries;
CREATE POLICY "Customers view own enquiries"
  ON public.enquiries FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers create own enquiries" ON public.enquiries;
CREATE POLICY "Customers create own enquiries"
  ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND status = 'Pending'::public.status_enum
  );

DROP POLICY IF EXISTS "Customers view own enquiry messages" ON public.enquiry_messages;
CREATE POLICY "Customers view own enquiry messages"
  ON public.enquiry_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.enquiries e
    WHERE e.enquiry_id = enquiry_messages.enquiry_id
      AND e.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Customers post messages on own enquiries" ON public.enquiry_messages;
CREATE POLICY "Customers post messages on own enquiries"
  ON public.enquiry_messages FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.enquiries e
      WHERE e.enquiry_id = enquiry_messages.enquiry_id
        AND e.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers view own enquiry status history" ON public.enquiry_status_history;
CREATE POLICY "Customers view own enquiry status history"
  ON public.enquiry_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.enquiries e
    WHERE e.enquiry_id = enquiry_status_history.enquiry_id
      AND e.user_id = (select auth.uid())
  ));

-- 4. Bookings & financial records (strictly read-only own; vendor reads linked bookings via helper)
DROP POLICY IF EXISTS "Customers view own bookings" ON public.bookings;
CREATE POLICY "Customers view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Vendors view bookings for own listings" ON public.bookings;
CREATE POLICY "Vendors view bookings for own listings"
  ON public.bookings FOR SELECT TO authenticated
  USING (
    vendor_id IS NOT NULL
    AND private.is_vendor_owner(vendor_id)
  );

DROP POLICY IF EXISTS "Customers view own booking documents" ON public.booking_documents;
CREATE POLICY "Customers view own booking documents"
  ON public.booking_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.booking_id = booking_documents.booking_id
      AND b.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Customers view own booking payments" ON public.booking_payments;
CREATE POLICY "Customers view own booking payments"
  ON public.booking_payments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.booking_id = booking_payments.booking_id
      AND b.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Customers view own payments" ON public.payments;
CREATE POLICY "Customers view own payments"
  ON public.payments FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers view own invoices" ON public.invoices;
CREATE POLICY "Customers view own invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers view own transactions" ON public.transactions;
CREATE POLICY "Customers view own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Customers view own refunds" ON public.refunds;
CREATE POLICY "Customers view own refunds"
  ON public.refunds FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.payment_id = refunds.payment_id
      AND p.user_id = (select auth.uid())
  ));

-- Remove broad authenticated coupon enumeration policy (validate via server service_role / RPC)
DROP POLICY IF EXISTS "Authenticated users view active coupons" ON public.coupons;

-- 5. Reviews, review images, review votes, blog interactions & reports
DROP POLICY IF EXISTS "Users view own reviews regardless of status" ON public.reviews;
CREATE POLICY "Users view own reviews regardless of status"
  ON public.reviews FOR SELECT TO authenticated
  USING (private.is_review_owner(review_id));

DROP POLICY IF EXISTS "Users create own pending reviews" ON public.reviews;
CREATE POLICY "Users create own pending reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id AND status = 'Pending'::public.status_enum);

DROP POLICY IF EXISTS "Users update own pending reviews" ON public.reviews;
CREATE POLICY "Users update own pending reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (private.is_review_owner(review_id) AND status = 'Pending'::public.status_enum)
  WITH CHECK (private.is_review_owner(review_id) AND status = 'Pending'::public.status_enum);

DROP POLICY IF EXISTS "Users delete own reviews" ON public.reviews;
CREATE POLICY "Users delete own reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (private.is_review_owner(review_id));

DROP POLICY IF EXISTS "Users manage images on own reviews" ON public.review_images;
CREATE POLICY "Users manage images on own reviews"
  ON public.review_images FOR ALL TO authenticated
  USING (private.is_review_owner(review_id))
  WITH CHECK (private.is_review_owner(review_id));

DROP POLICY IF EXISTS "Users manage own review votes" ON public.review_votes;
CREATE POLICY "Users manage own review votes"
  ON public.review_votes FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own blog comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users view own blog comments regardless of status" ON public.blog_comments;
CREATE POLICY "Users view own blog comments regardless of status"
  ON public.blog_comments FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users create own pending blog comments on published blogs" ON public.blog_comments;
CREATE POLICY "Users create own pending blog comments on published blogs"
  ON public.blog_comments FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND status = 'Pending'::public.status_enum
    AND EXISTS (
      SELECT 1 FROM public.blogs b
      WHERE b.blog_id = blog_comments.blog_id
        AND b.status = 'Published'::public.status_enum
    )
  );

DROP POLICY IF EXISTS "Users update own pending blog comments" ON public.blog_comments;
CREATE POLICY "Users update own pending blog comments"
  ON public.blog_comments FOR UPDATE TO authenticated
  USING (
    (select auth.uid()) = user_id
    AND status = 'Pending'::public.status_enum
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    AND status = 'Pending'::public.status_enum
    AND EXISTS (
      SELECT 1 FROM public.blogs b
      WHERE b.blog_id = blog_comments.blog_id
        AND b.status = 'Published'::public.status_enum
    )
  );

DROP POLICY IF EXISTS "Users delete own blog comments" ON public.blog_comments;
CREATE POLICY "Users delete own blog comments"
  ON public.blog_comments FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own blog likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Users view own blog likes" ON public.blog_likes;
CREATE POLICY "Users view own blog likes"
  ON public.blog_likes FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users create own blog likes on published blogs" ON public.blog_likes;
CREATE POLICY "Users create own blog likes on published blogs"
  ON public.blog_likes FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.blogs b
      WHERE b.blog_id = blog_likes.blog_id
        AND b.status = 'Published'::public.status_enum
    )
  );

DROP POLICY IF EXISTS "Users delete own blog likes" ON public.blog_likes;
CREATE POLICY "Users delete own blog likes"
  ON public.blog_likes FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users view own reports" ON public.reports;
CREATE POLICY "Users view own reports"
  ON public.reports FOR SELECT TO authenticated
  USING ((select auth.uid()) = reporter_id);

DROP POLICY IF EXISTS "Users submit own reports" ON public.reports;
CREATE POLICY "Users submit own reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = reporter_id);

-- 6. Invites (customer-owned; guest RSVP handled via validated server API)
DROP POLICY IF EXISTS "Users manage own invites" ON public.invites;
CREATE POLICY "Users manage own invites"
  ON public.invites FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage guests on own invites" ON public.invite_guests;
CREATE POLICY "Users manage guests on own invites"
  ON public.invite_guests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invites i WHERE i.invite_id = invite_guests.invite_id AND i.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invites i WHERE i.invite_id = invite_guests.invite_id AND i.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users manage media on own invites" ON public.invite_media;
CREATE POLICY "Users manage media on own invites"
  ON public.invite_media FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invites i WHERE i.invite_id = invite_media.invite_id AND i.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invites i WHERE i.invite_id = invite_media.invite_id AND i.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users view RSVP on own invites" ON public.invite_rsvp;
CREATE POLICY "Users view RSVP on own invites"
  ON public.invite_rsvp FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invite_guests g
    JOIN public.invites i ON i.invite_id = g.invite_id
    WHERE g.guest_id = invite_rsvp.guest_id
      AND i.user_id = (select auth.uid())
  ));

-- 7. Conversations, messages, notifications & personal search history
DROP POLICY IF EXISTS "Participants view own conversations" ON public.conversations;
CREATE POLICY "Participants view own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (vendor_id IS NOT NULL AND private.is_vendor_owner(vendor_id))
  );

DROP POLICY IF EXISTS "Users create own conversations" ON public.conversations;
CREATE POLICY "Users create own conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Participants view conversation messages" ON public.messages;
CREATE POLICY "Participants view conversation messages"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.conversation_id = messages.conversation_id
      AND (c.user_id = (select auth.uid()) OR private.is_vendor_owner(c.vendor_id))
  ));

DROP POLICY IF EXISTS "Participants send conversation messages" ON public.messages;
CREATE POLICY "Participants send conversation messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.conversation_id = messages.conversation_id
        AND (c.user_id = (select auth.uid()) OR private.is_vendor_owner(c.vendor_id))
    )
  );

DROP POLICY IF EXISTS "Participants mark messages read" ON public.messages;
CREATE POLICY "Participants mark messages read"
  ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.conversation_id = messages.conversation_id
      AND (c.user_id = (select auth.uid()) OR private.is_vendor_owner(c.vendor_id))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.conversation_id = messages.conversation_id
      AND (c.user_id = (select auth.uid()) OR private.is_vendor_owner(c.vendor_id))
  ));

DROP POLICY IF EXISTS "Participants view message attachments" ON public.message_attachments;
CREATE POLICY "Participants view message attachments"
  ON public.message_attachments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.conversation_id = m.conversation_id
    WHERE m.message_id = message_attachments.message_id
      AND (c.user_id = (select auth.uid()) OR private.is_vendor_owner(c.vendor_id))
  ));

DROP POLICY IF EXISTS "Participants upload attachments to own messages" ON public.message_attachments;
CREATE POLICY "Participants upload attachments to own messages"
  ON public.message_attachments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.message_id = message_attachments.message_id
      AND m.sender_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users manage own chat notifications" ON public.chat_notifications;
CREATE POLICY "Users manage own chat notifications"
  ON public.chat_notifications FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users mark own notifications read" ON public.notifications;
CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own recent searches" ON public.recent_searches;
CREATE POLICY "Users manage own recent searches"
  ON public.recent_searches FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own search filters" ON public.search_filters;
CREATE POLICY "Users manage own search filters"
  ON public.search_filters FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 8. Vendor ownership policies (evaluated via `private.is_vendor_owner(vendor_id)`)
DROP POLICY IF EXISTS "Vendor owners view own inactive or active listings" ON public.vendors;
CREATE POLICY "Vendor owners view own inactive or active listings"
  ON public.vendors FOR SELECT TO authenticated
  USING (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners update own listing safe fields" ON public.vendors;
CREATE POLICY "Vendor owners update own listing safe fields"
  ON public.vendors FOR UPDATE TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own contacts" ON public.vendor_contacts;
CREATE POLICY "Vendor owners manage own contacts"
  ON public.vendor_contacts FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own gallery" ON public.vendor_gallery;
CREATE POLICY "Vendor owners manage own gallery"
  ON public.vendor_gallery FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own pricing" ON public.vendor_pricing;
CREATE POLICY "Vendor owners manage own pricing"
  ON public.vendor_pricing FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own services" ON public.vendor_services;
CREATE POLICY "Vendor owners manage own services"
  ON public.vendor_services FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own availability" ON public.vendor_availability;
CREATE POLICY "Vendor owners manage own availability"
  ON public.vendor_availability FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own faq" ON public.vendor_faq;
CREATE POLICY "Vendor owners manage own faq"
  ON public.vendor_faq FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own packages" ON public.vendor_packages;
CREATE POLICY "Vendor owners manage own packages"
  ON public.vendor_packages FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own social links" ON public.vendor_social_links;
CREATE POLICY "Vendor owners manage own social links"
  ON public.vendor_social_links FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own team" ON public.vendor_team;
CREATE POLICY "Vendor owners manage own team"
  ON public.vendor_team FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));

DROP POLICY IF EXISTS "Vendor owners manage own videos" ON public.vendor_videos;
CREATE POLICY "Vendor owners manage own videos"
  ON public.vendor_videos FOR ALL TO authenticated
  USING (private.is_vendor_owner(vendor_id))
  WITH CHECK (private.is_vendor_owner(vendor_id));
