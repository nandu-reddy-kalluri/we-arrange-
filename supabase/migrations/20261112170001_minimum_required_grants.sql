-- ============================================================================
-- STATUS: PREPARED — NOT APPLIED (External Security Review Required)
-- Migration 01: Minimum Required Table, Column, and Sequence Grants
-- Target: YouMarriageWeArrange (zujjiiljvjwgcxtaqype)
--
-- Preconditions verified on live DB:
--   * anon, authenticated, and service_role currently hold 0 DML grants (arwd)
--     on all 97 public tables and 0 USAGE grants on all 93 sequences, while
--     erroneously retaining Dxtm (TRUNCATE, REFERENCES, TRIGGER, MAINTAIN).
--   * public.vendors.metadata contains scraped PII (phone, phone_numbers_raw,
--     email, email_raw, whatsapp_available, import_source, source_row) on
--     1,655 of 2,995 rows.
-- Design:
--   * Revoke ALL table & sequence privileges (including TRUNCATE, REFERENCES,
--     TRIGGER, MAINTAIN) from PUBLIC, anon, authenticated, and service_role.
--   * Grant service_role strictly minimal DML per table based on backend module
--     requirements (zero TRUNCATE/REFERENCES/TRIGGER/MAINTAIN; zero DELETE on
--     financial & audit logs; SELECT-only on booking_status; ZERO grants on
--     staging table photographers_import_v2).
--   * Grant service_role USAGE, SELECT strictly on the 92 sequences backing
--     backend-insertable tables (excluding booking_status_status_id_seq).
--   * Protect Contact PII & internal identifiers on public SELECT:
--       - venues: column-scoped SELECT (excludes phone, external_id, member_id,
--         membership_id, source_url; retains website & google_maps per Decision 1).
--       - vendors: column-scoped SELECT (excludes metadata & user_id) and removes
--         metadata from vendor self-service UPDATE.
--       - blogs / inspirations / real_weddings: exclude author_id / created_by.
--       - reviews / review_votes / blog_comments / blog_likes: exclude user_id.
--       - venue_contacts & vendor_contacts: ZERO anon grants.
-- ============================================================================

-- 1. Clean baseline: revoke all existing table & sequence privileges (including Dxtm)
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Server-only service_role least-privilege table grants
-- (Zero grants on photographers_import_v2; zero TRUNCATE/REFERENCES/TRIGGER/MAINTAIN anywhere.)

-- 2a. Reference-only table (read-only lookup)
GRANT SELECT ON
  public.booking_status
TO service_role;

-- 2b. Immutable audit & delivery logs (append-only: SELECT, INSERT; no UPDATE/DELETE)
GRANT SELECT, INSERT ON
  public.enquiry_status_history,
  public.moderation_logs,
  public.notification_logs
TO service_role;

-- 2c. Financial ledgers, reports, system settings & core reference tables (no hard DELETE)
GRANT SELECT, INSERT, UPDATE ON
  public.bookings,
  public.payments,
  public.booking_payments,
  public.invoices,
  public.transactions,
  public.refunds,
  public.reports,
  public.report_reasons,
  public.countries,
  public.states,
  public.currencies,
  public.languages,
  public.app_settings
TO service_role;

-- 2d. Mutable operational, catalog, user, RBAC, vendor, CMS & messaging tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.admins,
  public.areas,
  public.banners,
  public.blog_categories,
  public.blog_comments,
  public.blog_likes,
  public.blog_tags,
  public.blogs,
  public.booking_documents,
  public.chat_notifications,
  public.cities,
  public.collections,
  public.conversations,
  public.coupons,
  public.email_templates,
  public.enquiries,
  public.enquiry_messages,
  public.faqs,
  public.favorites,
  public.home_sections,
  public.inspiration_categories,
  public.inspiration_gallery,
  public.inspirations,
  public.invite_guests,
  public.invite_media,
  public.invite_rsvp,
  public.invite_templates,
  public.invites,
  public.localities,
  public.message_attachments,
  public.messages,
  public.notification_templates,
  public.notifications,
  public.pages,
  public.permissions,
  public.popular_searches,
  public.real_weddings,
  public.recent_searches,
  public.review_images,
  public.review_votes,
  public.reviews,
  public.role_permissions,
  public.roles,
  public.search_filters,
  public.seo,
  public.sms_templates,
  public.testimonials,
  public.themes,
  public.user_profile,
  public.users,
  public.vendor_availability,
  public.vendor_categories,
  public.vendor_contacts,
  public.vendor_faq,
  public.vendor_gallery,
  public.vendor_packages,
  public.vendor_pricing,
  public.vendor_services,
  public.vendor_social_links,
  public.vendor_team,
  public.vendor_videos,
  public.vendors,
  public.venue_amenities,
  public.venue_availability,
  public.venue_contacts,
  public.venue_faq,
  public.venue_features,
  public.venue_gallery,
  public.venue_menus,
  public.venue_packages,
  public.venue_parking,
  public.venue_pricing,
  public.venue_room_details,
  public.venue_types,
  public.venue_videos,
  public.venues,
  public.wedding_gallery,
  public.wedding_tags,
  public.wedding_vendors
TO service_role;

-- 2e. Sequence USAGE, SELECT strictly for the 92 sequences backing backend-insertable tables
-- (Excludes booking_status_status_id_seq; photographers_import_v2 has no sequence;
--  venue_menus_menu_id_seq backs the identity column on venue_menus and is granted in Migration 02.)
GRANT USAGE, SELECT ON SEQUENCE
  public.admins_admin_id_seq,
  public.app_settings_setting_id_seq,
  public.areas_area_id_seq,
  public.banners_banner_id_seq,
  public.blog_categories_category_id_seq,
  public.blog_comments_comment_id_seq,
  public.blog_likes_like_id_seq,
  public.blog_tags_tag_id_seq,
  public.blogs_blog_id_seq,
  public.booking_documents_document_id_seq,
  public.booking_payments_booking_payment_id_seq,
  public.bookings_booking_id_seq,
  public.chat_notifications_notification_id_seq,
  public.cities_city_id_seq,
  public.collections_collection_id_seq,
  public.conversations_conversation_id_seq,
  public.countries_country_id_seq,
  public.coupons_coupon_id_seq,
  public.currencies_currency_id_seq,
  public.email_templates_template_id_seq,
  public.enquiries_enquiry_id_seq,
  public.enquiry_messages_message_id_seq,
  public.enquiry_status_history_history_id_seq,
  public.faqs_faq_id_seq,
  public.favorites_favorite_id_seq,
  public.home_sections_section_id_seq,
  public.inspiration_categories_category_id_seq,
  public.inspiration_gallery_gallery_id_seq,
  public.inspirations_inspiration_id_seq,
  public.invite_guests_guest_id_seq,
  public.invite_media_media_id_seq,
  public.invite_rsvp_rsvp_id_seq,
  public.invite_templates_template_id_seq,
  public.invites_invite_id_seq,
  public.invoices_invoice_id_seq,
  public.languages_language_id_seq,
  public.localities_locality_id_seq,
  public.message_attachments_attachment_id_seq,
  public.messages_message_id_seq,
  public.moderation_logs_log_id_seq,
  public.notification_logs_log_id_seq,
  public.notification_templates_template_id_seq,
  public.notifications_notification_id_seq,
  public.pages_page_id_seq,
  public.payments_payment_id_seq,
  public.permissions_permission_id_seq,
  public.popular_searches_popular_search_id_seq,
  public.real_weddings_wedding_id_seq,
  public.recent_searches_search_id_seq,
  public.refunds_refund_id_seq,
  public.report_reasons_reason_id_seq,
  public.reports_report_id_seq,
  public.review_images_image_id_seq,
  public.review_votes_vote_id_seq,
  public.reviews_review_id_seq,
  public.roles_role_id_seq,
  public.search_filters_filter_id_seq,
  public.seo_seo_id_seq,
  public.sms_templates_template_id_seq,
  public.states_state_id_seq,
  public.testimonials_testimonial_id_seq,
  public.themes_theme_id_seq,
  public.transactions_transaction_id_seq,
  public.user_profile_profile_id_seq,
  public.vendor_availability_availability_id_seq,
  public.vendor_categories_category_id_seq,
  public.vendor_contacts_contact_id_seq,
  public.vendor_faq_faq_id_seq,
  public.vendor_gallery_gallery_id_seq,
  public.vendor_packages_package_id_seq,
  public.vendor_pricing_pricing_id_seq,
  public.vendor_services_service_id_seq,
  public.vendor_social_links_social_id_seq,
  public.vendor_team_team_id_seq,
  public.vendor_videos_video_id_seq,
  public.vendors_vendor_id_seq,
  public.venue_amenities_amenity_id_seq,
  public.venue_availability_availability_id_seq,
  public.venue_contacts_contact_id_seq,
  public.venue_faq_faq_id_seq,
  public.venue_features_feature_id_seq,
  public.venue_gallery_gallery_id_seq,
  public.venue_packages_package_id_seq,
  public.venue_parking_parking_id_seq,
  public.venue_pricing_pricing_id_seq,
  public.venue_room_details_room_id_seq,
  public.venue_types_type_id_seq,
  public.venue_videos_video_id_seq,
  public.venues_venue_id_seq,
  public.wedding_gallery_gallery_id_seq,
  public.wedding_tags_tag_id_seq,
  public.wedding_vendors_wedding_vendor_id_seq
TO service_role;

-- 3. Public Catalog & CMS: column-scoped SELECT where tables contain PII or internal IDs

-- 3a. public.venues: excludes phone, external_id, member_id, membership_id, source_url
-- (venues.slug is added in Migration 02 and granted SELECT there.)
GRANT SELECT (
  venue_id,
  type_id,
  venue_name,
  description,
  area_id,
  address,
  rating,
  price_range,
  capacity,
  status,
  created_at,
  locality_name,
  primary_locality,
  base_city,
  pincode,
  short_summary,
  about_venue,
  reviews_count,
  best_rating,
  worst_rating,
  price_subtext,
  currency,
  venue_price_tag,
  category_price_suffix_text,
  destination_price,
  destination_price_unit,
  guest_count_min,
  guest_count_max,
  indoor_outdoor_spaces,
  catering_policy,
  decor_policy,
  availability_start_time,
  availability_end_time,
  website,
  google_maps,
  features,
  rules_policies
) ON public.venues TO anon, authenticated;

-- 3b. public.vendors: excludes metadata (contains scraped phone/email/import_source) & user_id
GRANT SELECT (
  vendor_id,
  category_id,
  vendor_name,
  slug,
  description,
  logo,
  cover_image,
  rating,
  is_verified,
  status,
  created_at,
  updated_at
) ON public.vendors TO anon, authenticated;

-- 3c. Editorial, review & engagement tables: exclude author_id / created_by / user_id UUIDs
GRANT SELECT (
  blog_id,
  category_id,
  title,
  slug,
  short_description,
  content,
  featured_image,
  status,
  published_at,
  created_at,
  updated_at
) ON public.blogs TO anon, authenticated;

GRANT SELECT (
  inspiration_id,
  category_id,
  title,
  description,
  image_url,
  video_url,
  status,
  created_at,
  updated_at
) ON public.inspirations TO anon, authenticated;

GRANT SELECT (
  wedding_id,
  title,
  description,
  wedding_date,
  city_id,
  cover_image,
  status,
  created_at,
  updated_at
) ON public.real_weddings TO anon, authenticated;

GRANT SELECT (
  review_id,
  venue_id,
  vendor_id,
  rating,
  review_text,
  status,
  created_at,
  updated_at
) ON public.reviews TO anon, authenticated;

GRANT SELECT (
  vote_id,
  review_id,
  vote_type,
  created_at
) ON public.review_votes TO anon, authenticated;

GRANT SELECT (
  comment_id,
  blog_id,
  comment,
  status,
  created_at,
  updated_at
) ON public.blog_comments TO anon, authenticated;

GRANT SELECT (
  like_id,
  blog_id,
  created_at
) ON public.blog_likes TO anon, authenticated;

-- 3d. Public read-only catalog child, location, CMS & reference tables (no PII columns)
-- (Strictly EXCLUDES venue_contacts & vendor_contacts.)
GRANT SELECT ON
  public.venue_types,
  public.venue_gallery,
  public.venue_pricing,
  public.venue_faq,
  public.venue_room_details,
  public.venue_amenities,
  public.venue_availability,
  public.venue_features,
  public.venue_menus,
  public.venue_packages,
  public.venue_parking,
  public.venue_videos,
  public.vendor_categories,
  public.vendor_gallery,
  public.vendor_pricing,
  public.vendor_services,
  public.vendor_availability,
  public.vendor_faq,
  public.vendor_packages,
  public.vendor_social_links,
  public.vendor_team,
  public.vendor_videos,
  public.countries,
  public.states,
  public.cities,
  public.areas,
  public.localities,
  public.banners,
  public.blog_categories,
  public.blog_tags,
  public.faqs,
  public.home_sections,
  public.inspiration_categories,
  public.inspiration_gallery,
  public.pages,
  public.seo,
  public.wedding_gallery,
  public.wedding_tags,
  public.wedding_vendors,
  public.testimonials,
  public.themes,
  public.currencies,
  public.languages,
  public.popular_searches,
  public.booking_status,
  public.invite_templates,
  public.report_reasons,
  public.review_images
TO anon, authenticated;

-- 4. Authenticated customer / participant / vendor-owner minimal table grants
-- (All row visibility and mutations remain strictly enforced by RLS policies.)

-- Users & profile: users.role_id & users.status excluded from self-UPDATE
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (full_name, phone, updated_at) ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profile TO authenticated;

-- Favorites & collections
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;

-- Enquiries (customers create/read own; status history read-only to customer)
GRANT SELECT, INSERT ON public.enquiries, public.enquiry_messages TO authenticated;
GRANT SELECT ON public.enquiry_status_history TO authenticated;

-- Bookings & Payments (read-only for owners via RLS; writes via verified server routes)
GRANT SELECT ON
  public.bookings,
  public.booking_documents,
  public.booking_payments,
  public.payments,
  public.invoices,
  public.transactions,
  public.refunds,
  public.coupons
TO authenticated;

-- Reviews, votes, comments & reports
GRANT INSERT, UPDATE (rating, review_text, updated_at), DELETE ON public.reviews TO authenticated;
GRANT INSERT, DELETE ON public.review_images, public.review_votes TO authenticated;
GRANT INSERT, UPDATE (comment, updated_at), DELETE ON public.blog_comments TO authenticated;
GRANT INSERT, DELETE ON public.blog_likes TO authenticated;
GRANT SELECT, INSERT ON public.reports TO authenticated;

-- Invites (authenticated owners manage own invites, guests, and media)
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.invites,
  public.invite_guests,
  public.invite_media
TO authenticated;
GRANT SELECT ON public.invite_rsvp TO authenticated;

-- Conversations, messages & notifications
GRANT SELECT, INSERT ON public.conversations, public.messages, public.message_attachments TO authenticated;
GRANT UPDATE (is_read) ON public.messages, public.chat_notifications TO authenticated;
GRANT SELECT ON public.chat_notifications, public.notifications TO authenticated;
GRANT UPDATE (is_read, read_at) ON public.notifications TO authenticated;

-- Personal search state
GRANT SELECT, INSERT, DELETE ON public.recent_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_filters TO authenticated;

-- Vendor owner self-service updates (excludes is_verified, status, user_id, and metadata)
GRANT UPDATE (vendor_name, category_id, slug, description, logo, cover_image, updated_at) ON public.vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.vendor_contacts,
  public.vendor_gallery,
  public.vendor_pricing,
  public.vendor_services,
  public.vendor_availability,
  public.vendor_faq,
  public.vendor_packages,
  public.vendor_social_links,
  public.vendor_team,
  public.vendor_videos
TO authenticated;

-- Role lookup & concierge-gated contact lookup (all rows remain strictly gated by RLS;
-- anon receives ZERO grants on admins, roles, and venue_contacts)
GRANT SELECT ON public.admins, public.roles, public.venue_contacts TO authenticated;

-- 5. Sequence USAGE, SELECT grants strictly for authenticated user-insertable tables
GRANT USAGE, SELECT ON SEQUENCE
  public.user_profile_profile_id_seq,
  public.favorites_favorite_id_seq,
  public.collections_collection_id_seq,
  public.enquiries_enquiry_id_seq,
  public.enquiry_messages_message_id_seq,
  public.reviews_review_id_seq,
  public.review_images_image_id_seq,
  public.review_votes_vote_id_seq,
  public.blog_comments_comment_id_seq,
  public.blog_likes_like_id_seq,
  public.reports_report_id_seq,
  public.invites_invite_id_seq,
  public.invite_guests_guest_id_seq,
  public.invite_media_media_id_seq,
  public.conversations_conversation_id_seq,
  public.messages_message_id_seq,
  public.message_attachments_attachment_id_seq,
  public.recent_searches_search_id_seq,
  public.search_filters_filter_id_seq,
  public.vendor_contacts_contact_id_seq,
  public.vendor_gallery_gallery_id_seq,
  public.vendor_pricing_pricing_id_seq,
  public.vendor_services_service_id_seq,
  public.vendor_availability_availability_id_seq,
  public.vendor_faq_faq_id_seq,
  public.vendor_packages_package_id_seq,
  public.vendor_social_links_social_id_seq,
  public.vendor_team_team_id_seq,
  public.vendor_videos_video_id_seq
TO authenticated;

-- Note: app_settings, email_templates, sms_templates, notification_templates,
-- notification_logs, moderation_logs, permissions, and role_permissions
-- intentionally receive ZERO grants for anon/authenticated.
-- photographers_import_v2 intentionally receives ZERO grants for anon/authenticated/service_role.
