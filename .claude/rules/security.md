# YMWA Coding Security Rules

This document outlines key security protocols and constraints for the **YouMarriageWeArrange** repository.

---

## 1. Authentication & Session Validation
- Use Supabase Auth client helpers exclusively in middleware and route layers.
- Session validity checks must run inside Next.js Middleware or Server Component headers to prevent unauthorized layouts mounts.

## 2. Role Authorization Matrix
- Roles are structured as: `customer`, `vendor`, `admin`.
- Route grouping guards must verify token roles prior to server page assembly.
- Any access violation must trigger automatic redirection to `/login`.

## 3. Data Sanitization & Input Checks
- Sanitise inputs prior to database queries.
- Clean search fields (Banjara Hills, Jubilee Hills, etc.) from scripts injection.
- Validate email and password inputs strictly at register endpoints.
