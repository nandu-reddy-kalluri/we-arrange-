-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (Phase 2, Step 2B Review Only)
-- Migration 06: Create Covering Indexes for All 111 Unindexed Foreign Keys
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Preconditions verified on live DB:
--   * 117 public FKs total; 6 already covered by PK/UNIQUE leading indexes
--     (users.user_id, user_profile.user_id, admins.user_id, blog_likes.blog_id,
--      review_votes.review_id, role_permissions.role_id).
--   * 111 unindexed FKs reported by Supabase advisor 0001_unindexed_foreign_keys.
-- ============================================================================

-- Locations
CREATE INDEX IF NOT EXISTS idx_states_country_id ON public.states (country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities (state_id);
CREATE INDEX IF NOT EXISTS idx_areas_city_id ON public.areas (city_id);
CREATE INDEX IF NOT EXISTS idx_localities_area_id ON public.localities (area_id);

-- Venues & sub-tables
CREATE INDEX IF NOT EXISTS idx_venues_type_id ON public.venues (type_id);
CREATE INDEX IF NOT EXISTS idx_venues_area_id ON public.venues (area_id);
CREATE INDEX IF NOT EXISTS idx_venue_amenities_venue_id ON public.venue_amenities (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_availability_venue_id ON public.venue_availability (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_contacts_venue_id ON public.venue_contacts (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_faq_venue_id ON public.venue_faq (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_features_venue_id ON public.venue_features (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_gallery_venue_id ON public.venue_gallery (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_menus_venue_id ON public.venue_menus (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_packages_venue_id ON public.venue_packages (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_parking_venue_id ON public.venue_parking (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_pricing_venue_id ON public.venue_pricing (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_room_details_venue_id ON public.venue_room_details (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_videos_venue_id ON public.venue_videos (venue_id);

-- Vendors & sub-tables
CREATE INDEX IF NOT EXISTS idx_vendors_category_id ON public.vendors (category_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors (user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_id ON public.vendor_availability (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor_id ON public.vendor_contacts (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_faq_vendor_id ON public.vendor_faq (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_gallery_vendor_id ON public.vendor_gallery (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_packages_vendor_id ON public.vendor_packages (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pricing_vendor_id ON public.vendor_pricing (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor_id ON public.vendor_services (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_social_links_vendor_id ON public.vendor_social_links (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_team_vendor_id ON public.vendor_team (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_videos_vendor_id ON public.vendor_videos (vendor_id);

-- Users, profiles & RBAC
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users (role_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_city_id ON public.user_profile (city_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_area_id ON public.user_profile (area_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions (permission_id);

-- Bookings & payments
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON public.bookings (venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON public.bookings (vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_id ON public.bookings (status_id);
CREATE INDEX IF NOT EXISTS idx_booking_documents_booking_id ON public.booking_documents (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON public.booking_payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON public.invoices (payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON public.transactions (payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds (payment_id);

-- Enquiries, conversations & notifications
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_venue_id ON public.enquiries (venue_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_vendor_id ON public.enquiries (vendor_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_enquiry_id ON public.enquiry_messages (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_sender_id ON public.enquiry_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_status_history_enquiry_id ON public.enquiry_status_history (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_status_history_changed_by ON public.enquiry_status_history (changed_by);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor_id ON public.conversations (vendor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_venue_id ON public.conversations (venue_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation_id ON public.chat_notifications (conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_message_id ON public.chat_notifications (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user_id ON public.chat_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_template_id ON public.notifications (template_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON public.notification_logs (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs (user_id);

-- Favorites, collections, reviews, reports & moderation
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_venue_id ON public.favorites (venue_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vendor_id ON public.favorites (vendor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_inspiration_id ON public.favorites (inspiration_id);
CREATE INDEX IF NOT EXISTS idx_favorites_blog_id ON public.favorites (blog_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_venue_id ON public.reviews (venue_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON public.reviews (vendor_id);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images (review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON public.review_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reason_id ON public.reports (reason_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports (reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_venue_id ON public.reports (venue_id);
CREATE INDEX IF NOT EXISTS idx_reports_vendor_id ON public.reports (vendor_id);
CREATE INDEX IF NOT EXISTS idx_reports_review_id ON public.reports (review_id);
CREATE INDEX IF NOT EXISTS idx_reports_blog_id ON public.reports (blog_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_report_id ON public.moderation_logs (report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator_id ON public.moderation_logs (moderator_id);

-- Invites, editorial, search & SEO
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON public.invites (user_id);
CREATE INDEX IF NOT EXISTS idx_invites_template_id ON public.invites (template_id);
CREATE INDEX IF NOT EXISTS idx_invite_guests_invite_id ON public.invite_guests (invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_media_invite_id ON public.invite_media (invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_rsvp_guest_id ON public.invite_rsvp (guest_id);
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON public.blogs (category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs (author_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments (blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_blog_id ON public.blog_tags (blog_id);
CREATE INDEX IF NOT EXISTS idx_inspirations_category_id ON public.inspirations (category_id);
CREATE INDEX IF NOT EXISTS idx_inspirations_created_by ON public.inspirations (created_by);
CREATE INDEX IF NOT EXISTS idx_inspiration_gallery_inspiration_id ON public.inspiration_gallery (inspiration_id);
CREATE INDEX IF NOT EXISTS idx_real_weddings_city_id ON public.real_weddings (city_id);
CREATE INDEX IF NOT EXISTS idx_real_weddings_created_by ON public.real_weddings (created_by);
CREATE INDEX IF NOT EXISTS idx_wedding_gallery_wedding_id ON public.wedding_gallery (wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_tags_wedding_id ON public.wedding_tags (wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_wedding_id ON public.wedding_vendors (wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_vendor_id ON public.wedding_vendors (vendor_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_venue_id ON public.wedding_vendors (venue_id);
CREATE INDEX IF NOT EXISTS idx_seo_page_id ON public.seo (page_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON public.recent_searches (user_id);
CREATE INDEX IF NOT EXISTS idx_search_filters_user_id ON public.search_filters (user_id);

