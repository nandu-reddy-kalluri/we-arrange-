# YMWA Skill Guide: Supabase Integration

This document outlines patterns for database access, schema constraints, and client helpers.

---

## 1. Client Abstractions
- **Browser Client:** Use inside Client Components via `@supabase/ssr` or custom client creators.
- **Server Client:** Use inside Next.js Route Handlers and Server Actions to fetch database elements securely.

## 2. Row Level Security (RLS)
- All tables must enable Row Level Security.
- Verify user ID checks on all modification queries (saved venues, quotes updates) using authenticated tokens.
