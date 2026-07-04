# YMWA Skill Guide: Search Engine Optimization

This document outlines sitemap rules, schemas, and metadata standards for YouMarriageWeArrange.

---

## 1. Structured Schemas (JSON-LD)
We win rich snippets on Google search by injecting structured data:
- **Venues:** Inject `LocalBusiness` and `AggregateRating` schemas on venue detail pages.
- **Wedding Events:** Inject `Event` details containing coordinator contacts.
- **Curation Articles:** Inject `Article` schemas on blog pages.

## 2. Dynamic Metadata
- Export a static `metadata` object or implement `generateMetadata` dynamically inside `page.tsx` routes.
- Always include title, descriptive meta description, and keywords to rank search results.
- Set up canonical URLs to prevent duplicate indexing across routes.
