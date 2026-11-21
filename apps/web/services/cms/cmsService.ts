import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination, slugify } from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export const CMS_PUBLIC_RESOURCES = [
  "pages",
  "blogs",
  "inspirations",
  "real-weddings",
  "faqs",
  "testimonials",
  "banners",
  "home-sections",
  "themes",
  "invite-templates",
] as const;

export type CmsPublicResource = (typeof CMS_PUBLIC_RESOURCES)[number];

export async function listPublicCmsResource(
  supabase: SupabaseClient<Database>,
  resource: CmsPublicResource,
  options: { page?: number; limit?: number; slug?: string }
) {
  const { page, limit, from, to } = normalizePagination(options);

  switch (resource) {
    case "pages": {
      if (options.slug) {
        const { data: pageRow, error } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", options.slug)
          .eq("status", "Published")
          .maybeSingle();
        if (error) throw mapDatabaseError(error, "Failed to load page.");
        if (!pageRow) throw new AppError("NOT_FOUND", 404, "Page not found.");
        const { data: seoRow } = await supabase
          .from("seo")
          .select("*")
          .eq("page_id", pageRow.page_id)
          .maybeSingle();
        return { items: [{ ...pageRow, seo: seoRow ?? null }], meta: buildPaginationMeta(1, 1, 1) };
      }
      const { data, error, count } = await supabase
        .from("pages")
        .select("*", { count: "exact" })
        .eq("status", "Published")
        .order("page_id", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to list pages.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "blogs": {
      if (options.slug) {
        const { data: blog, error } = await supabase
          .from("blogs")
          .select(
            "blog_id, category_id, title, slug, short_description, content, featured_image, status, published_at, created_at, updated_at"
          )
          .eq("slug", options.slug)
          .eq("status", "Published")
          .maybeSingle();
        if (error) throw mapDatabaseError(error, "Failed to load blog.");
        if (!blog) throw new AppError("NOT_FOUND", 404, "Blog article not found.");
        const [tagsRes, commentsRes, likesRes] = await Promise.all([
          supabase.from("blog_tags").select("tag_id, tag_name").eq("blog_id", blog.blog_id),
          supabase
            .from("blog_comments")
            .select("comment_id, blog_id, comment, status, created_at")
            .eq("blog_id", blog.blog_id)
            .in("status", ["Active", "Approved", "Published"])
            .order("created_at", { ascending: false }),
          supabase.from("blog_likes").select("like_id", { count: "exact", head: true }).eq("blog_id", blog.blog_id),
        ]);
        return {
          items: [
            {
              ...blog,
              tags: (tagsRes.data ?? []).map((t) => t.tag_name),
              comments: commentsRes.data ?? [],
              likesCount: likesRes.count ?? 0,
            },
          ],
          meta: buildPaginationMeta(1, 1, 1),
        };
      }

      const { data, error, count } = await supabase
        .from("blogs")
        .select(
          "blog_id, category_id, title, slug, short_description, featured_image, status, published_at, created_at, updated_at",
          { count: "exact" }
        )
        .eq("status", "Published")
        .order("published_at", { ascending: false })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to list blogs.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "inspirations": {
      const { data, error, count } = await supabase
        .from("inspirations")
        .select(
          "inspiration_id, category_id, title, description, image_url, video_url, status, created_at, updated_at",
          { count: "exact" }
        )
        .in("status", ["Active", "Published"])
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to list inspirations.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "real-weddings": {
      const { data, error, count } = await supabase
        .from("real_weddings")
        .select(
          "wedding_id, title, description, wedding_date, city_id, cover_image, status, created_at, updated_at",
          { count: "exact" }
        )
        .in("status", ["Active", "Published"])
        .order("wedding_date", { ascending: false })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to list real weddings.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "faqs": {
      const { data, error, count } = await supabase
        .from("faqs")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("sort_order", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load FAQs.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "testimonials": {
      const { data, error, count } = await supabase
        .from("testimonials")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("sort_order", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load testimonials.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "banners": {
      const { data, error, count } = await supabase
        .from("banners")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load banners.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "home-sections": {
      const { data, error, count } = await supabase
        .from("home_sections")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("sort_order", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load home sections.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "themes": {
      const { data, error, count } = await supabase
        .from("themes")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("theme_id", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load themes.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }

    case "invite-templates": {
      const { data, error, count } = await supabase
        .from("invite_templates")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("template_id", { ascending: true })
        .range(from, to);
      if (error) throw mapDatabaseError(error, "Failed to load invite templates.");
      return { items: data ?? [], meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0) };
    }
  }
}

export async function listGeoLocations(
  supabase: SupabaseClient<Database>,
  filter: { countryId?: number; stateId?: number; cityId?: number; areaId?: number }
) {
  if (filter.areaId) {
    const { data, error } = await supabase
      .from("localities")
      .select("*")
      .eq("area_id", filter.areaId)
      .eq("status", "Active")
      .order("name", { ascending: true });
    if (error) throw mapDatabaseError(error, "Failed to load localities.");
    return { level: "localities", items: data ?? [] };
  }
  if (filter.cityId) {
    const { data, error } = await supabase
      .from("areas")
      .select("*")
      .eq("city_id", filter.cityId)
      .eq("status", "Active")
      .order("name", { ascending: true });
    if (error) throw mapDatabaseError(error, "Failed to load areas.");
    return { level: "areas", items: data ?? [] };
  }
  if (filter.stateId) {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", filter.stateId)
      .eq("status", "Active")
      .order("name", { ascending: true });
    if (error) throw mapDatabaseError(error, "Failed to load cities.");
    return { level: "cities", items: data ?? [] };
  }
  if (filter.countryId) {
    const { data, error } = await supabase
      .from("states")
      .select("*")
      .eq("country_id", filter.countryId)
      .eq("status", "Active")
      .order("name", { ascending: true });
    if (error) throw mapDatabaseError(error, "Failed to load states.");
    return { level: "states", items: data ?? [] };
  }

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("status", "Active")
    .order("name", { ascending: true });
  if (error) throw mapDatabaseError(error, "Failed to load countries.");
  return { level: "countries", items: data ?? [] };
}

export async function createBlogComment(
  supabase: SupabaseClient<Database>,
  blogId: number,
  userId: string,
  comment: string
) {
  const { data: blog, error: blogErr } = await supabase
    .from("blogs")
    .select("blog_id")
    .eq("blog_id", blogId)
    .eq("status", "Published")
    .maybeSingle();
  if (blogErr) throw mapDatabaseError(blogErr, "Failed to verify blog article.");
  if (!blog) throw new AppError("NOT_FOUND", 404, "Published blog not found.");

  const { data, error } = await supabase
    .from("blog_comments")
    .insert({ blog_id: blogId, user_id: userId, comment, status: "Pending" })
    .select("comment_id, blog_id, comment, status, created_at")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to submit blog comment.");
  return data;
}

export async function toggleBlogLike(
  supabase: SupabaseClient<Database>,
  blogId: number,
  userId: string
) {
  if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");

  const { data: blog, error: blogErr } = await supabase
    .from("blogs")
    .select("blog_id")
    .eq("blog_id", blogId)
    .eq("status", "Published")
    .maybeSingle();
  if (blogErr) throw mapDatabaseError(blogErr, "Failed to verify blog article.");
  if (!blog) throw new AppError("NOT_FOUND", 404, "Published blog not found.");

  const { data: existing, error: selectErr } = await supabase
    .from("blog_likes")
    .select("like_id")
    .eq("blog_id", blogId)
    .eq("user_id", userId)
    .maybeSingle();
  if (selectErr) throw mapDatabaseError(selectErr, "Failed to check blog like.");

  if (existing) {
    const { error: delErr } = await supabase
      .from("blog_likes")
      .delete()
      .eq("like_id", existing.like_id)
      .eq("user_id", userId);
    if (delErr) throw mapDatabaseError(delErr, "Failed to unlike blog.");
    return { liked: false };
  }

  const { error } = await supabase
    .from("blog_likes")
    .insert({ blog_id: blogId, user_id: userId });
  if (error) throw mapDatabaseError(error, "Failed to like blog.");
  return { liked: true };
}

// ── Admin / Concierge CMS Management ─────────────────────────────────────────
export async function adminCreatePage(
  adminClient: SupabaseClient<Database>,
  input: {
    pageName: string;
    slug: string;
    title?: string;
    content?: string;
    featuredImage?: string | null;
    status: "Draft" | "Published" | "Inactive";
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      canonicalUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    };
  }
) {
  const { data: page, error } = await adminClient
    .from("pages")
    .insert({
      page_name: input.pageName,
      slug: input.slug,
      title: input.title ?? null,
      content: input.content ?? null,
      featured_image: input.featuredImage ?? null,
      status: input.status,
    })
    .select("*")
    .single();
  if (error || !page) throw mapDatabaseError(error, "Failed to create page.");

  if (input.seo) {
    await adminClient.from("seo").insert({
      page_id: page.page_id,
      meta_title: input.seo.metaTitle ?? null,
      meta_description: input.seo.metaDescription ?? null,
      meta_keywords: input.seo.metaKeywords ?? null,
      canonical_url: input.seo.canonicalUrl ?? null,
      og_title: input.seo.ogTitle ?? null,
      og_description: input.seo.ogDescription ?? null,
      og_image: input.seo.ogImage ?? null,
    });
  }

  return page;
}

export async function adminCreateBlog(
  adminClient: SupabaseClient<Database>,
  authorId: string,
  input: {
    categoryId?: number;
    title: string;
    slug?: string;
    shortDescription?: string;
    content?: string;
    featuredImage?: string | null;
    tags?: string[];
    status: "Draft" | "Published" | "Inactive";
  }
) {
  const { data: blog, error } = await adminClient
    .from("blogs")
    .insert({
      category_id: input.categoryId ?? null,
      title: input.title,
      slug: input.slug ?? `${slugify(input.title)}-${Date.now().toString().slice(-4)}`,
      short_description: input.shortDescription ?? null,
      content: input.content ?? null,
      featured_image: input.featuredImage ?? null,
      author_id: authorId,
      status: input.status,
      published_at: input.status === "Published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  if (error || !blog) throw mapDatabaseError(error, "Failed to create blog article.");

  if (input.tags && input.tags.length > 0) {
    await adminClient.from("blog_tags").insert(
      input.tags.map((tagName) => ({
        blog_id: blog.blog_id,
        tag_name: tagName,
      }))
    );
  }

  return blog;
}

export async function adminCreateBanner(
  adminClient: SupabaseClient<Database>,
  input: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    mobileImageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    sortOrder: number;
    status: "active" | "inactive" | "pending";
  }
) {
  const { data, error } = await adminClient
    .from("banners")
    .insert({
      title: input.title ?? null,
      subtitle: input.subtitle ?? null,
      image_url: input.imageUrl ?? null,
      mobile_image_url: input.mobileImageUrl ?? null,
      button_text: input.buttonText ?? null,
      button_url: input.buttonUrl ?? null,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create banner.");
  return data;
}

export async function adminCreateHomeSection(
  adminClient: SupabaseClient<Database>,
  input: {
    sectionName: string;
    sectionType?: string;
    title?: string;
    description?: string;
    content?: Record<string, unknown>;
    sortOrder: number;
    status: "Active" | "Inactive" | "Draft";
  }
) {
  const { data, error } = await adminClient
    .from("home_sections")
    .insert({
      section_name: input.sectionName,
      section_type: input.sectionType ?? null,
      title: input.title ?? null,
      description: input.description ?? null,
      content: (input.content ?? null) as Json,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create home section.");
  return data;
}

export async function adminCreateFaq(
  adminClient: SupabaseClient<Database>,
  input: {
    question: string;
    answer: string;
    category?: string;
    sortOrder: number;
    status: "Active" | "Inactive";
  }
) {
  const { data, error } = await adminClient
    .from("faqs")
    .insert({
      question: input.question,
      answer: input.answer,
      category: input.category ?? null,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create FAQ.");
  return data;
}

export async function adminCreateTestimonial(
  adminClient: SupabaseClient<Database>,
  input: {
    name: string;
    designation?: string;
    message: string;
    imageUrl?: string;
    rating?: number;
    sortOrder: number;
    status: "Active" | "Inactive";
  }
) {
  const { data, error } = await adminClient
    .from("testimonials")
    .insert({
      name: input.name,
      designation: input.designation ?? null,
      message: input.message,
      image_url: input.imageUrl ?? null,
      rating: input.rating ?? null,
      sort_order: input.sortOrder,
      status: input.status,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to create testimonial.");
  return data;
}

const ADMIN_CMS_TABLE_MAP = {
  pages: { table: "pages", pk: "page_id" },
  blogs: { table: "blogs", pk: "blog_id" },
  banners: { table: "banners", pk: "banner_id" },
  "home-sections": { table: "home_sections", pk: "section_id" },
  faqs: { table: "faqs", pk: "faq_id" },
  testimonials: { table: "testimonials", pk: "testimonial_id" },
} as const;

export async function adminListCmsResource(
  adminClient: SupabaseClient<Database>,
  resource: string,
  pagination?: { page?: number; limit?: number }
) {
  const cfg = ADMIN_CMS_TABLE_MAP[resource as keyof typeof ADMIN_CMS_TABLE_MAP];
  if (!cfg) {
    throw new AppError("NOT_FOUND", 404, `Unsupported admin CMS resource '${resource}'.`);
  }
  const { page, limit, from, to } = normalizePagination(pagination);
  const { data, error, count } = await adminClient
    .from(cfg.table)
    .select("*", { count: "exact" })
    .order(cfg.pk as never, { ascending: false })
    .range(from, to);
  if (error) throw mapDatabaseError(error, `Failed to list CMS ${resource}.`);
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function adminDeleteCmsResource(
  adminClient: SupabaseClient<Database>,
  resource: string,
  id: number
) {
  const cfg = ADMIN_CMS_TABLE_MAP[resource as keyof typeof ADMIN_CMS_TABLE_MAP];
  if (!cfg) {
    throw new AppError("NOT_FOUND", 404, `Unsupported admin CMS resource '${resource}'.`);
  }
  const { data, error } = await adminClient
    .from(cfg.table)
    .delete()
    .eq(cfg.pk as never, id)
    .select(cfg.pk)
    .maybeSingle();
  if (error) throw mapDatabaseError(error, `Failed to delete CMS ${resource}.`);
  if (!data) throw new AppError("NOT_FOUND", 404, `CMS ${resource} entry not found.`);
  return { deleted: true, id };
}

// ── E-Invites & Public RSVP ──────────────────────────────────────────────────
export async function listUserInvites(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw mapDatabaseError(error, "Failed to list e-invites.");
  return data ?? [];
}

export async function createUserInvite(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    templateId?: number;
    title: string;
    slug?: string;
    brideName: string;
    groomName: string;
    eventDate?: string;
    eventTime?: string;
    venueName?: string;
    venueAddress?: string;
    message?: string;
    coverImage?: string | null;
    status: "Draft" | "Published" | "Active";
  }
) {
  const inviteSlug =
    input.slug ?? `${slugify(input.title)}-${Date.now().toString().slice(-5)}`;

  const { data, error } = await supabase
    .from("invites")
    .insert({
      user_id: userId,
      template_id: input.templateId ?? null,
      title: input.title,
      slug: inviteSlug,
      bride_name: input.brideName,
      groom_name: input.groomName,
      event_date: input.eventDate ?? null,
      event_time: input.eventTime ?? null,
      venue_name: input.venueName ?? null,
      venue_address: input.venueAddress ?? null,
      message: input.message ?? null,
      cover_image: input.coverImage ?? null,
      status: input.status,
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to create e-invite.");
  return data;
}

export async function getOwnedInvite(
  supabase: SupabaseClient<Database>,
  userId: string,
  inviteId: number
) {
  const { data: invite, error } = await supabase
    .from("invites")
    .select("*")
    .eq("invite_id", inviteId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load e-invite.");
  if (!invite) throw new AppError("NOT_FOUND", 404, "Invite not found.");
  if (invite.user_id !== userId) {
    throw new AppError("FORBIDDEN", 403, "Access denied to this e-invite.");
  }

  const [guestsRes, mediaRes] = await Promise.all([
    supabase
      .from("invite_guests")
      .select("*")
      .eq("invite_id", inviteId)
      .order("guest_id", { ascending: true }),
    supabase
      .from("invite_media")
      .select("*")
      .eq("invite_id", inviteId)
      .order("sort_order", { ascending: true }),
  ]);

  const guestIds = (guestsRes.data ?? []).map((g) => g.guest_id);
  const rsvpRes =
    guestIds.length > 0
      ? await supabase.from("invite_rsvp").select("*").in("guest_id", guestIds)
      : { data: [] };

  return {
    invite,
    guests: guestsRes.data ?? [],
    media: mediaRes.data ?? [],
    rsvps: rsvpRes.data ?? [],
  };
}

export async function updateOwnedInvite(
  supabase: SupabaseClient<Database>,
  userId: string,
  inviteId: number,
  input: {
    templateId?: number;
    title?: string;
    slug?: string;
    brideName?: string;
    groomName?: string;
    eventDate?: string;
    eventTime?: string;
    venueName?: string;
    venueAddress?: string;
    message?: string;
    coverImage?: string | null;
    status?: "Draft" | "Published" | "Active";
  }
) {
  await getOwnedInvite(supabase, userId, inviteId);

  const patch: Database["public"]["Tables"]["invites"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.templateId !== undefined) patch.template_id = input.templateId;
  if (input.title !== undefined) patch.title = input.title;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.brideName !== undefined) patch.bride_name = input.brideName;
  if (input.groomName !== undefined) patch.groom_name = input.groomName;
  if (input.eventDate !== undefined) patch.event_date = input.eventDate;
  if (input.eventTime !== undefined) patch.event_time = input.eventTime;
  if (input.venueName !== undefined) patch.venue_name = input.venueName;
  if (input.venueAddress !== undefined) patch.venue_address = input.venueAddress;
  if (input.message !== undefined) patch.message = input.message;
  if (input.coverImage !== undefined) patch.cover_image = input.coverImage;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("invites")
    .update(patch)
    .eq("invite_id", inviteId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to update e-invite.");
  return data;
}

export async function addInviteGuest(
  supabase: SupabaseClient<Database>,
  userId: string,
  inviteId: number,
  input: { guestName: string; phone?: string; email?: string; relationship?: string }
) {
  await getOwnedInvite(supabase, userId, inviteId);

  const { data, error } = await supabase
    .from("invite_guests")
    .insert({
      invite_id: inviteId,
      guest_name: input.guestName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      relationship: input.relationship ?? null,
      invitation_status: "Invited",
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to add invite guest.");
  return data;
}

export async function deleteOwnedInvite(
  supabase: SupabaseClient<Database>,
  userId: string,
  inviteId: number
) {
  await getOwnedInvite(supabase, userId, inviteId);
  const { error } = await supabase
    .from("invites")
    .delete()
    .eq("invite_id", inviteId)
    .eq("user_id", userId);
  if (error) throw mapDatabaseError(error, "Failed to delete e-invite.");
  return { deleted: true, inviteId };
}

export async function removeInviteGuest(
  supabase: SupabaseClient<Database>,
  userId: string,
  inviteId: number,
  guestId: number
) {
  await getOwnedInvite(supabase, userId, inviteId);
  const { data, error } = await supabase
    .from("invite_guests")
    .delete()
    .eq("invite_id", inviteId)
    .eq("guest_id", guestId)
    .select("guest_id")
    .maybeSingle();
  if (error) throw mapDatabaseError(error, "Failed to remove invite guest.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Invite guest not found.");
  return { deleted: true, inviteId, guestId };
}

export async function getPublicInviteBySlug(
  adminClient: SupabaseClient<Database>,
  slug: string
) {
  const { data: invite, error } = await adminClient
    .from("invites")
    .select(
      "invite_id, template_id, title, slug, bride_name, groom_name, event_date, event_time, venue_name, venue_address, message, cover_image, status, created_at"
    )
    .eq("slug", slug)
    .in("status", ["Published", "Active"])
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load invite.");
  if (!invite) throw new AppError("NOT_FOUND", 404, "Published e-invite not found.");

  const { data: media } = await adminClient
    .from("invite_media")
    .select("media_id, media_type, media_url, sort_order")
    .eq("invite_id", invite.invite_id)
    .order("sort_order", { ascending: true });

  return { invite, media: media ?? [] };
}

export async function submitPublicInviteRsvp(
  adminClient: SupabaseClient<Database>,
  slug: string,
  input: {
    guestId?: number;
    guestName?: string;
    email?: string;
    response: "Attending" | "Declined" | "Maybe";
    guestCount: number;
    message?: string;
  }
) {
  const { invite } = await getPublicInviteBySlug(adminClient, slug);

  let resolvedGuestId = input.guestId;

  if (resolvedGuestId) {
    const { data: guest } = await adminClient
      .from("invite_guests")
      .select("guest_id, invite_id")
      .eq("guest_id", resolvedGuestId)
      .eq("invite_id", invite.invite_id)
      .maybeSingle();
    if (!guest) {
      throw new AppError("NOT_FOUND", 404, "Guest record not found for this invite.");
    }
  } else if (input.guestName) {
    const { data: newGuest, error: gErr } = await adminClient
      .from("invite_guests")
      .insert({
        invite_id: invite.invite_id,
        guest_name: input.guestName,
        email: input.email ?? null,
        invitation_status: input.response,
      })
      .select("guest_id")
      .single();
    if (gErr || !newGuest) throw mapDatabaseError(gErr, "Failed to register RSVP guest.");
    resolvedGuestId = newGuest.guest_id;
  } else {
    throw new AppError("VALIDATION_ERROR", 400, "Guest identifier or name is required.");
  }

  const nowIso = new Date().toISOString();
  await adminClient
    .from("invite_guests")
    .update({ invitation_status: input.response })
    .eq("guest_id", resolvedGuestId);

  const { data: rsvp, error: rErr } = await adminClient
    .from("invite_rsvp")
    .insert({
      guest_id: resolvedGuestId,
      response: input.response,
      guest_count: input.guestCount,
      message: input.message ?? null,
      responded_at: nowIso,
    })
    .select("rsvp_id, response, guest_count, responded_at")
    .single();

  if (rErr || !rsvp) throw mapDatabaseError(rErr, "Failed to record RSVP.");
  return rsvp;
}
